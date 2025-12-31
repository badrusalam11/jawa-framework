const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');

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

async function createZipArchive(sourceDir, outputPath) {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure output directory exists
      await fs.ensureDir(path.dirname(outputPath));
      
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      output.on('close', () => {
        const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
        console.log(chalk.gray(`  ✓ ${path.basename(outputPath)} (${sizeMB} MB)`));
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, path.basename(sourceDir));
      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
}

async function runCommand(options) {
  // Load .env file
  const envVars = loadEnv();
  
  // Get environment from --env flag or .env file, default to 'dev'
  const targetEnv = options.env || envVars.TARGET_ENV || 'dev';
  
  // Debug: Show where environment came from
  let envSource = 'default';
  if (options.env) {
    envSource = '--env flag';
  } else if (envVars.TARGET_ENV) {
    envSource = '.env file';
  }
  
  // Parse options with new naming convention (with .env fallback)
  const jmxFile = options.file || path.join('plan', 'main.jmx');
  const loopCount = parseInt(options.loop || envVars.LOOP) || 1;
  const threadCount = parseInt(options.user || envVars.THREADS) || 1;
  const rampUp = parseInt(options.ramp || envVars.RAMPUP) || 1;
  const duration = parseInt(options.duration || envVars.DURATION) || 0;
  const baseUrl = options.baseUrl || envVars.BASE_URL || 'http://localhost:8080';
  const gui = options.gui || false;
  const heapSize = options.heap || envVars.HEAP_SIZE || '3g';
  const remoteHosts = options.remote || ''; // Remote hosts for distributed testing
  const isDistributed = remoteHosts.trim().length > 0;
  
  // Generate timestamp for this run (format: YYYYMMDD-HHMMSS)
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, '')
    .replace('T', '-')
    .substring(0, 15); // YYYYMMDDTHHMMSS -> YYYYMMDD-HHMMSS
  
  // Define paths with timestamp
  const reportDir = path.join('reports', `report-${timestamp}`);
  const resultDir = path.join('results', `result-${timestamp}`);
  const logsDir = 'jmeter_logs';
  const resultFile = 'result.csv';
  const logFile = path.join(logsDir, `jmeter-${timestamp}.log`);

  // Create necessary directories
  try {
    await fs.ensureDir('reports');
    await fs.ensureDir(reportDir);
    await fs.ensureDir('results');
    await fs.ensureDir(resultDir);
    await fs.ensureDir(logsDir);
    await fs.ensureDir('result-zips');
    await fs.ensureDir('report-zips');
  } catch (err) {
    console.log(chalk.red('❌ Error creating directories:'), err.message);
    process.exit(1);
  }

  // Check if test file exists
  if (!await fs.pathExists(jmxFile)) {
    console.log(chalk.red(`❌ Test file not found: ${jmxFile}`));
    console.log(chalk.yellow('💡 Initialize a new project with: jawa init my-project'));
    process.exit(1);
  }

  // Set JVM heap memory
  const heapArgs = `-Xms${heapSize} -Xmx${heapSize} -XX:MaxMetaspaceSize=512m -Xss1m -XX:+UseG1GC`;
  
  console.log(chalk.blue('\n🚀 JAWA Performance Test Runner\n'));
  console.log(chalk.gray('═'.repeat(50)));
  console.log(chalk.cyan('Configuration:'));
  console.log(chalk.gray(`  Environment   : ${targetEnv} ${chalk.yellow(`(from ${envSource})`)}`));
  console.log(chalk.gray(`  Test File     : ${jmxFile}`));
  console.log(chalk.gray(`  Mode          : ${isDistributed ? 'Distributed (Remote)' : 'Local'}`));
  if (isDistributed) {
    console.log(chalk.gray(`  Remote Hosts  : ${remoteHosts}`));
  }
  console.log(chalk.gray(`  Users         : ${threadCount}`));
  console.log(chalk.gray(`  Ramp-up       : ${rampUp}s`));
  console.log(chalk.gray(`  Loop Count    : ${loopCount}`));
  console.log(chalk.gray(`  Duration      : ${duration}s ${duration === 0 ? '(loop-based)' : ''}`));
  console.log(chalk.gray(`  Heap Memory   : ${heapSize}`));
  console.log(chalk.gray(`  Timestamp     : ${timestamp}`));
  console.log(chalk.gray('═'.repeat(50) + '\n'));

  if (gui) {
    // Open JMeter GUI mode
    console.log(chalk.blue('🖥️  Opening JMeter GUI...\n'));
    const jmeter = spawn('jmeter', ['-t', jmxFile], { stdio: 'inherit' });
    
    jmeter.on('exit', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✅ JMeter GUI closed.\n'));
      }
    });
    return;
  }

  // Build JMeter command for non-GUI mode
  // Fix: JMeter doesn't accept duration=0 with scheduler enabled
  // If duration=0, set to very high number and rely on loop count
  const effectiveDuration = duration === 0 ? 999999 : duration;
  
  const jmeterCmd = 'jmeter';
  const jmeterArgs = [
    '-n',
    '-t', jmxFile,
    '-l', resultFile,
    '-j', logFile,
    '-e',
    '-o', reportDir,
    '-f', // Force overwrite report directory
    `-JresultTimestamp=${timestamp}`,
    `-JtargetEnv=${targetEnv}`,
    `-JthreadTargetNumber=${threadCount}`,
    `-JthreadRampUpPeriod=${rampUp}`,
    `-JthreadLoopCount=${loopCount}`,
    `-JthreadLifetimeDuration=${effectiveDuration}`,
    `-Jbase.url=${baseUrl}`
  ];

  // Add remote hosts if specified (Distributed Testing)
  if (isDistributed) {
    jmeterArgs.push('-R', remoteHosts);
  }

  // Add environment-specific user.properties if exists
  const envUserProps = path.join('prop', targetEnv, 'user.properties');
  if (await fs.pathExists(envUserProps)) {
    jmeterArgs.push('-q', envUserProps);
    console.log(chalk.gray(`  ℹ️  Loading properties: ${envUserProps}`));
  } else {
    console.log(chalk.yellow(`  ⚠️  Properties not found: ${envUserProps}`));
    // Fallback to root user.properties (backward compatibility)
    if (await fs.pathExists('user.properties')) {
      jmeterArgs.push('-q', 'user.properties');
      console.log(chalk.gray(`  ℹ️  Using fallback: user.properties`));
    } else {
      console.log(chalk.yellow(`  ⚠️  No properties file found! Using JMeter defaults.`));
    }
  }
  
  // Add environment-specific jmeter.properties if exists
  const envJMeterProps = path.join('prop', targetEnv, 'jmeter.properties');
  if (await fs.pathExists(envJMeterProps)) {
    jmeterArgs.push('-q', envJMeterProps);
    console.log(chalk.gray(`  ℹ️  Loading JMeter config: ${envJMeterProps}`));
  }
  
  console.log();

  // Check if JMeter is installed (cross-platform)
  const checkCmd = process.platform === 'win32' ? 'where' : 'which';
  const checkJMeter = spawn(checkCmd, ['jmeter']);
  
  let jmeterFound = false;
  checkJMeter.on('exit', (code) => {
    if (code === 0) {
      jmeterFound = true;
    }
  });

  // Wait a bit for check to complete
  await new Promise(resolve => setTimeout(resolve, 100));

  if (!jmeterFound) {
    console.log(chalk.red('❌ JMeter is not installed or not in PATH!'));
    console.log(chalk.yellow('\n📦 Install JMeter:'));
    console.log(chalk.gray('  macOS/Linux : brew install jmeter'));
    console.log(chalk.gray('  Windows     : choco install jmeter'));
    console.log(chalk.gray('  Manual      : https://jmeter.apache.org/download_jmeter.cgi\n'));
    process.exit(1);
  }

  console.log(chalk.blue('⚡ Running test with dynamic report generation...\n'));

  // Debug: Print full JMeter command
  console.log(chalk.yellow('🐛 Debug - JMeter Command:'));
  console.log(chalk.gray(`  ${jmeterCmd} ${jmeterArgs.join(' ')}`));
  console.log(chalk.gray('═'.repeat(50) + '\n'));

  // Prepare environment with HEAP settings
  const env = { ...process.env };
  env.HEAP = heapArgs;
  
  // If distributed testing, disable SSL for RMI
  if (isDistributed) {
    env.JVM_ARGS = '-Dserver.rmi.ssl.disable=true';
    console.log(chalk.yellow('🔓 Distributed Testing: SSL disabled for RMI communication'));
    console.log(chalk.gray(`   JVM_ARGS=${env.JVM_ARGS}\n`));
  } else if (process.platform === 'win32') {
    // For Windows compatibility, we need to set JVM_ARGS
    env.JVM_ARGS = heapArgs;
  }

  // Run JMeter with all arguments
  const jmeter = spawn(jmeterCmd, jmeterArgs, {
    stdio: 'inherit',
    env: env,
    shell: true // Important for Windows compatibility
  });

  jmeter.on('error', (err) => {
    console.log(chalk.red('\n❌ Error running JMeter:'), err.message);
    process.exit(1);
  });

  jmeter.on('exit', async (code) => {
    if (code === 0) {
      console.log(chalk.green('\n✅ Test completed successfully!\n'));
      
      // Post-processing: Copy properties files to report
      try {
        if (await fs.pathExists('user.properties')) {
          await fs.copy('user.properties', path.join(reportDir, 'user.properties'));
          console.log(chalk.gray('  ✓ Copied user.properties to report'));
        }
        if (await fs.pathExists('system.properties')) {
          await fs.copy('system.properties', path.join(reportDir, 'system.properties'));
          console.log(chalk.gray('  ✓ Copied system.properties to report'));
        }
      } catch (err) {
        console.log(chalk.yellow('  ⚠️  Could not copy properties files'));
      }

      // Move result.csv to results directory
      console.log('');
      try {
        if (await fs.pathExists(resultFile)) {
          const viewResultsPath = path.join(resultDir, 'view-results-in-table.csv');
          await fs.move(resultFile, viewResultsPath, { overwrite: true });
          console.log(chalk.gray('  ✓ Results saved to: ' + viewResultsPath));
        }
      } catch (err) {
        console.log(chalk.yellow('  ⚠️  Could not move results file'));
      }

      // Create ZIP archives
      console.log(chalk.blue('\n📦 Creating ZIP archives...\n'));
      
      try {
        await Promise.all([
          createZipArchive(resultDir, path.join('result-zips', `result-${timestamp}.zip`)),
          createZipArchive(reportDir, path.join('report-zips', `report-${timestamp}.zip`))
        ]);
      } catch (err) {
        console.log(chalk.yellow('\n⚠️  Could not create ZIP archives:'), err.message);
      }

      // Final summary
      console.log(chalk.green('\n✅ All done!\n'));
      console.log(chalk.blue('═'.repeat(50)));
      console.log(chalk.cyan('📊 Report Summary:'));
      console.log(chalk.gray('  HTML Report  : ' + path.resolve(reportDir, 'index.html')));
      console.log(chalk.gray('  Results ZIP  : ' + path.resolve('result-zips', `result-${timestamp}.zip`)));
      console.log(chalk.gray('  Report ZIP   : ' + path.resolve('report-zips', `report-${timestamp}.zip`)));
      console.log(chalk.blue('═'.repeat(50)));
      console.log(chalk.yellow('\n💡 Open report: jawa report\n'));
      
    } else {
      console.log(chalk.red(`\n❌ Test failed with exit code ${code}\n`));
      console.log(chalk.yellow('Check the log file for details:'));
      console.log(chalk.gray(`  ${path.resolve(logFile)}\n`));
    }
  });
}

module.exports = runCommand;
