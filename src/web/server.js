const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { parseJMX } = require('./parser');
const { modifyJMX } = require('./modifier');
const { spawn } = require('child_process');

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
        
        // Modify JMX
        const modifiedJMXPath = modifyJMX(jmxPath, selectedGroups);
        
        console.log(chalk.blue('\n🌐 Starting test from Web UI...\n'));
        console.log(chalk.cyan('Configuration:'));
        console.log(chalk.gray(`  Environment     : ${environment}`));
        console.log(chalk.gray(`  Selected Groups : ${selectedGroups.join(', ')}`));
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
        const resultFile = path.join(process.cwd(), `result-${timestamp}.csv`);
        const logFile = path.join(process.cwd(), 'jmeter_logs', `jmeter-${timestamp}.log`);
        
        // Ensure directories exist
        await fs.ensureDir(path.join(process.cwd(), 'reports'));
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
        
        jmeter.on('close', (code) => {
          this.testProcess = null;
          
          if (code === 0) {
            console.log(chalk.green('\n✅ Test completed successfully!\n'));
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
        running: this.testProcess !== null 
      });
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
