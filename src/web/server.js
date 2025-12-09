const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { parseJMX, parseSamplers } = require('./parser');
const { modifyJMX } = require('./modifier');
const { spawn } = require('child_process');

// Function to parse JMeter CSV results
function parseJMeterCSV(csvPath) {
  if (!fs.existsSync(csvPath)) {
    return [];
  }

  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    if (lines.length <= 1) {
      return []; // No data or only header
    }

    const stats = {};

    // Parse CSV properly (handle quoted fields with newlines)
    for (let i = 1; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;

      // Handle multi-line records (quoted fields with newlines)
      while (line.split('"').length % 2 === 0 && i + 1 < lines.length) {
        i++;
        line += '\n' + lines[i];
      }

      // Simple CSV parse (handle quotes)
      const parts = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current);

      if (parts.length < 10) continue;

      let label = parts[2] ? parts[2].trim() : ''; // Column 3: label
      if (!label) {
        // If label is empty (error case), use responseMessage or fallback
        const errorMsg = parts[4] ? parts[4].trim() : 'Unknown Error';
        label = `[ERROR] ${errorMsg}`;
      }

      const success = parts[7] === 'true'; // Column 8: success
      const elapsed = parseInt(parts[1], 10) || 0; // Column 2: elapsed time (ms)
      const bytes = parseInt(parts[9], 10) || 0; // Column 10: bytes

      if (!stats[label]) {
        stats[label] = {
          count: 0,
          failures: 0,
          times: [],
          bytes: []
        };
      }

      stats[label].count++;
      if (!success) {
        stats[label].failures++;
      }
      stats[label].times.push(elapsed);
      stats[label].bytes.push(bytes);
    }

    // Calculate aggregated stats
    const result = Object.keys(stats).map(label => {
      const data = stats[label];
      const sortedTimes = data.times.slice().sort((a, b) => a - b);
      
      const median = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0;
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
      const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
      const avg = Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length) || 0;
      const min = Math.min(...data.times) || 0;
      const max = Math.max(...data.times) || 0;
      const avgSize = Math.round(data.bytes.reduce((a, b) => a + b, 0) / data.bytes.length) || 0;

      return {
        type: 'HTTP',
        name: label,
        requests: data.count,
        fails: data.failures,
        median,
        p95,
        p99,
        avg,
        min,
        max,
        avgSize,
        currentRps: 0,
        currentFailures: 0
      };
    });

    return result;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

// Function to load .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

class WebServer {
  constructor(port = null) {
    this.app = express();
    
    // Load .env file
    const envVars = loadEnv();
    
    // Priority: constructor param > env var (.env file) > default
    const envPort = envVars.PORT ? parseInt(envVars.PORT) : null;
    this.port = port || envPort || 7247; // JAWA on phone keypad = 5292, but use 7247 (unique)
    
    this.testProcess = null;
    this.testState = {
      running: false,
      reportDir: null,
      timestamp: null,
      resultFile: null,
      samplers: []
    };
    
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(__dirname, 'public')));
  }
  
  setupRoutes() {
    // GET / - Main page
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    
    // GET /api/environments - Get available environments
    this.app.get('/api/environments', (req, res) => {
      try {
        const propDir = path.join(process.cwd(), 'prop');
        
        if (!fs.existsSync(propDir)) {
          return res.json({ environments: [] });
        }
        
        const environments = fs.readdirSync(propDir)
          .filter(file => {
            const stat = fs.statSync(path.join(propDir, file));
            return stat.isDirectory();
          });
        
        res.json({ environments });
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to read environments',
          message: error.message 
        });
      }
    });
    
    // GET /api/thread-groups - Get thread groups from JMX
    this.app.get('/api/thread-groups', (req, res) => {
      try {
        const jmxPath = path.join(process.cwd(), 'plan', 'main.jmx');
        
        if (!fs.existsSync(jmxPath)) {
          return res.status(404).json({ 
            error: 'JMX file not found',
            message: 'Please ensure plan/main.jmx exists' 
          });
        }
        
        const threadGroups = parseJMX(jmxPath);
        res.json({ threadGroups });
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to parse JMX',
          message: error.message 
        });
      }
    });
    
    // GET /api/stats - Get current test statistics
    this.app.get('/api/stats', (req, res) => {
      try {
        const isRunning = this.testState.running;
        const hasResults = this.testState.resultFile && fs.existsSync(this.testState.resultFile);
        
        let requests = [];
        let totalRequests = 0;
        let totalFailures = 0;
        
        // Debug logging
        console.log(`[STATS] Running: ${isRunning}, ResultFile: ${this.testState.resultFile}, Exists: ${hasResults}`);
        
        // Parse real CSV data if available
        if (hasResults) {
          requests = parseJMeterCSV(this.testState.resultFile);
          totalRequests = requests.reduce((sum, r) => sum + r.requests, 0);
          totalFailures = requests.reduce((sum, r) => sum + r.fails, 0);
          console.log(`[STATS] Parsed ${requests.length} samplers, ${totalRequests} total requests`);
        } else if (this.testState.samplers.length > 0) {
          // If test is starting but no data yet, show samplers with 0 values
          requests = this.testState.samplers.map(samplerName => ({
            type: 'HTTP',
            name: samplerName,
            requests: 0,
            fails: 0,
            median: 0,
            p95: 0,
            p99: 0,
            avg: 0,
            min: 0,
            max: 0,
            avgSize: 0,
            currentRps: 0,
            currentFailures: 0
          }));
        }
        
        const failureRate = totalRequests > 0 
          ? ((totalFailures / totalRequests) * 100).toFixed(1) + '%'
          : '0%';
        
        // Status logic: COMPLETED only if CSV has data AND test finished
        let status = 'READY';
        if (isRunning) {
          status = 'RUNNING';
        } else if (!isRunning && this.testState.reportDir && hasResults && totalRequests > 0) {
          status = 'COMPLETED';
        } else if (!isRunning && this.testState.reportDir) {
          // Test finished but CSV not ready yet
          status = 'PROCESSING';
        }
        
        const stats = {
          status,
          users: totalRequests, // Use total requests as approximation
          rps: 0, // TODO: Calculate from time window if needed
          failures: failureRate,
          requests,
          reportDir: this.testState.reportDir,
          timestamp: this.testState.timestamp
        };
        
        res.json(stats);
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get stats',
          message: error.message 
        });
      }
    });
    
    // POST /api/start-test - Start JMeter test
    this.app.post('/api/start-test', async (req, res) => {
      try {
        const {
          selectedGroups,
          environment,
          users,
          rampUp,
          mode,
          value,
          advancedOptions
        } = req.body;
        
        // Validate inputs
        if (!selectedGroups || selectedGroups.length === 0) {
          return res.status(400).json({ 
            error: 'No thread groups selected' 
          });
        }
        
        if (!environment) {
          return res.status(400).json({ 
            error: 'Environment is required' 
          });
        }
        
        const jmxPath = path.join(process.cwd(), 'plan', 'main.jmx');
        
        if (!fs.existsSync(jmxPath)) {
          return res.status(404).json({ 
            error: 'JMX file not found' 
          });
        }
        
        // Parse samplers from JMX to get actual endpoint names
        const samplers = parseSamplers(jmxPath);
        this.testState.samplers = samplers.length > 0 ? samplers : ['Default Request'];
        
        // Modify JMX
        const modifiedJMXPath = modifyJMX(jmxPath, selectedGroups);
        
        console.log(chalk.blue('\n🌐 Starting test from Web UI...\n'));
        console.log(chalk.cyan('Configuration:'));
        console.log(chalk.gray(`  Environment     : ${environment}`));
        console.log(chalk.gray(`  Selected Groups : ${selectedGroups.join(', ')}`));
        console.log(chalk.gray(`  Samplers Found  : ${this.testState.samplers.join(', ')}`));
        console.log(chalk.gray(`  Users           : ${users}`));
        console.log(chalk.gray(`  Ramp-up         : ${rampUp}s`));
        console.log(chalk.gray(`  Mode            : ${mode}`));
        console.log(chalk.gray(`  Value           : ${value}`));
        
        // Build JMeter command
        const timestamp = new Date().toISOString()
          .replace(/[-:]/g, '')
          .replace(/\.\d{3}Z$/, '')
          .replace('T', '-')
          .substring(0, 15);
        
        const reportDir = path.join(process.cwd(), 'reports', `report-${timestamp}`);
        const resultFile = path.join(process.cwd(), 'data', environment, `result-${timestamp}.csv`);
        const logFile = path.join(process.cwd(), 'jmeter_logs', `jmeter-${timestamp}.log`);
        
        // Ensure directories exist
        await fs.ensureDir(path.join(process.cwd(), 'reports'));
        await fs.ensureDir(path.join(process.cwd(), 'data', environment));
        await fs.ensureDir(path.join(process.cwd(), 'jmeter_logs'));
        
        // Load environment-specific properties
        const propPath = path.join(process.cwd(), 'prop', environment);
        const dataPath = path.join(process.cwd(), 'data', environment);
        
        const jmeterArgs = [
          '-n',
          '-t', modifiedJMXPath,
          '-l', resultFile,
          '-j', logFile,
          '-e',
          '-o', reportDir,
          '-f',
          `-JthreadTargetNumber=${users}`,
          `-JthreadRampUpPeriod=${rampUp}`,
        ];
        
        // Add property files if they exist
        if (fs.existsSync(propPath)) {
          const propFiles = fs.readdirSync(propPath).filter(f => f.endsWith('.properties'));
          propFiles.forEach(propFile => {
            jmeterArgs.push('-q', path.join(propPath, propFile));
          });
        }
        
        // Add loop or duration
        if (mode === 'loop') {
          jmeterArgs.push(`-JthreadLoopCount=${value}`);
          jmeterArgs.push(`-JthreadLifetimeDuration=999999`);
        } else {
          jmeterArgs.push(`-JthreadLoopCount=9999`);
          jmeterArgs.push(`-JthreadLifetimeDuration=${value}`);
        }
        
        // Add advanced options
        if (advancedOptions && Array.isArray(advancedOptions)) {
          advancedOptions.forEach(opt => {
            if (opt.key && opt.value) {
              jmeterArgs.push(`-J${opt.key}=${opt.value}`);
              console.log(chalk.gray(`  ${opt.key} = ${opt.value}`));
            }
          });
        }
        
        console.log(chalk.gray('═'.repeat(50)));
        
        // Debug: Show full JMeter command
        console.log(chalk.yellow('\n🔍 Debug - Full JMeter Command:'));
        console.log(chalk.gray(`jmeter ${jmeterArgs.join(' ')}`));
        console.log(chalk.gray('═'.repeat(50) + '\n'));
        
        // Start JMeter
        const jmeter = spawn('jmeter', jmeterArgs, {
          stdio: 'inherit',
          shell: true
        });
        
        this.testProcess = jmeter;
        this.testState.running = true;
        this.testState.reportDir = reportDir;
        this.testState.timestamp = timestamp;
        this.testState.resultFile = resultFile;
        
        jmeter.on('close', (code) => {
          this.testProcess = null;
          this.testState.running = false;
          
          if (code === 0) {
            console.log(chalk.green('\n✅ Test completed successfully!\n'));
            console.log(chalk.cyan(`   Report: ${reportDir}/index.html\n`));
          } else {
            console.log(chalk.red(`\n❌ Test failed with code ${code}\n`));
          }
        });
        
        res.json({ 
          status: 'started',
          message: 'Test is running. Check terminal for progress.',
          reportDir,
          timestamp
        });
        
      } catch (error) {
        console.error(chalk.red('Error starting test:'), error.message);
        res.status(500).json({ 
          error: 'Failed to start test',
          message: error.message 
        });
      }
    });
    
    // GET /api/test-status - Check if test is running
    this.app.get('/api/test-status', (req, res) => {
      res.json({ 
        running: this.testState.running,
        reportDir: this.testState.reportDir,
        timestamp: this.testState.timestamp
      });
    });
    
    // GET /api/report - Serve HTML report with static assets
    this.app.get('/api/report', (req, res) => {
      try {
        if (!this.testState.reportDir) {
          return res.status(404).json({ 
            error: 'No report available' 
          });
        }
        
        const reportIndex = path.join(this.testState.reportDir, 'index.html');
        
        if (!fs.existsSync(reportIndex)) {
          return res.status(404).json({ 
            error: 'Report not generated yet' 
          });
        }
        
        // Serve static files from report directory
        this.app.use('/report-assets', express.static(this.testState.reportDir));
        
        // Read and modify HTML to fix asset paths
        let html = fs.readFileSync(reportIndex, 'utf-8');
        html = html.replace(/href="(content\/[^"]+)"/g, 'href="/report-assets/$1"');
        html = html.replace(/src="(content\/[^"]+)"/g, 'src="/report-assets/$1"');
        html = html.replace(/href="(sbadmin2-[^"]+)"/g, 'href="/report-assets/$1"');
        html = html.replace(/src="(sbadmin2-[^"]+)"/g, 'src="/report-assets/$1"');
        
        res.send(html);
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to load report',
          message: error.message 
        });
      }
    });
    
    // GET /api/download/csv - Download results CSV
    this.app.get('/api/download/csv', (req, res) => {
      try {
        if (!this.testState.resultFile) {
          return res.status(404).json({ 
            error: 'No results available' 
          });
        }
        
        if (!fs.existsSync(this.testState.resultFile)) {
          return res.status(404).json({ 
            error: 'Results file not found' 
          });
        }
        
        const filename = path.basename(this.testState.resultFile);
        res.download(this.testState.resultFile, filename);
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to download CSV',
          message: error.message 
        });
      }
    });
    
    // GET /api/download/zip - Download report as ZIP
    this.app.get('/api/download/zip', async (req, res) => {
      try {
        if (!this.testState.reportDir) {
          return res.status(404).json({ 
            error: 'No report available' 
          });
        }
        
        if (!fs.existsSync(this.testState.reportDir)) {
          return res.status(404).json({ 
            error: 'Report directory not found' 
          });
        }
        
        const archiver = require('archiver');
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        const zipName = `report-${this.testState.timestamp}.zip`;
        
        res.attachment(zipName);
        archive.pipe(res);
        
        archive.directory(this.testState.reportDir, false);
        await archive.finalize();
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to create ZIP',
          message: error.message 
        });
      }
    });
    
    // GET /api/download/logs - Download JMeter logs
    this.app.get('/api/download/logs', (req, res) => {
      try {
        const logFile = path.join(process.cwd(), 'jmeter_logs', `jmeter-${this.testState.timestamp}.log`);
        
        if (!fs.existsSync(logFile)) {
          return res.status(404).json({ 
            error: 'Log file not found' 
          });
        }
        
        const filename = path.basename(logFile);
        res.download(logFile, filename);
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to download logs',
          message: error.message 
        });
      }
    });
    
    // POST /api/stop-test - Stop running test
    this.app.post('/api/stop-test', (req, res) => {
      try {
        if (!this.testProcess) {
          return res.status(400).json({ 
            error: 'No test is running' 
          });
        }
        
        this.testProcess.kill('SIGTERM');
        this.testProcess = null;
        this.testState.running = false;
        
        console.log(chalk.yellow('\n⏹ Test stopped by user\n'));
        
        res.json({ 
          status: 'stopped',
          message: 'Test has been stopped' 
        });
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to stop test',
          message: error.message 
        });
      }
    });
    
    // POST /api/reset - Reset test state
    this.app.post('/api/reset', (req, res) => {
      try {
        if (this.testProcess) {
          this.testProcess.kill('SIGTERM');
        }
        
        this.testProcess = null;
        this.testState = {
          running: false,
          reportDir: null,
          timestamp: null,
          resultFile: null,
          samplers: []
        };
        
        console.log(chalk.blue('\n🔄 Test state reset\n'));
        
        res.json({ 
          status: 'reset',
          message: 'Test state has been reset' 
        });
        
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to reset',
          message: error.message 
        });
      }
    });
  }
  
  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(chalk.blue('\n🚀 JAWA Web UI Started!\n'));
        console.log(chalk.cyan(`   URL: ${chalk.underline(`http://localhost:${this.port}`)}\n`));
        console.log(chalk.gray('   Press Ctrl+C to stop the server\n'));
        resolve();
      });
    });
  }
  
  stop() {
    if (this.server) {
      this.server.close();
    }
    if (this.testProcess) {
      this.testProcess.kill();
    }
  }
}

module.exports = WebServer;
