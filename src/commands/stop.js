const { spawn, exec } = require('child_process');
const chalk = require('chalk');

/**
 * Stop all running JAWA processes (JMeter tests and web servers)
 * Cross-platform: macOS, Linux, Windows
 */
function stopCommand() {
  console.log(chalk.yellow('\n🛑 Stopping all JAWA processes...\n'));

  const platform = process.platform;
  let killed = false;

  if (platform === 'win32') {
    // Windows: Use taskkill to stop processes
    stopWindows();
  } else {
    // macOS & Linux: Use pkill
    stopUnix();
  }
}

/**
 * Stop processes on Unix-like systems (macOS, Linux)
 */
function stopUnix() {
  const commands = [
    // Stop JMeter processes
    { cmd: 'pkill', args: ['-f', 'jmeter.*-n'], desc: 'JMeter test processes' },
    // Stop JAWA web server
    { cmd: 'pkill', args: ['-f', 'jawa run --web'], desc: 'JAWA web server' },
    { cmd: 'pkill', args: ['-f', 'node.*jawa.*--web'], desc: 'JAWA web server (node)' }
  ];

  let totalKilled = 0;

  commands.forEach(({ cmd, args, desc }) => {
    try {
      const result = spawn(cmd, args, { stdio: 'pipe' });
      
      result.on('exit', (code) => {
        if (code === 0) {
          totalKilled++;
          console.log(chalk.green(`✓ Stopped ${desc}`));
        }
      });
    } catch (error) {
      // Ignore errors (process might not be running)
    }
  });

  setTimeout(() => {
    if (totalKilled === 0) {
      console.log(chalk.gray('ℹ  No JAWA processes found running\n'));
    } else {
      console.log(chalk.green(`\n✅ Successfully stopped ${totalKilled} process(es)\n`));
    }
  }, 1000);
}

/**
 * Stop processes on Windows
 */
function stopWindows() {
  const commands = [
    // Stop JMeter processes
    'taskkill /F /FI "IMAGENAME eq jmeter.bat" /T 2>nul',
    'taskkill /F /FI "WINDOWTITLE eq jmeter*" /T 2>nul',
    // Stop JAWA web server (node processes running jawa)
    'taskkill /F /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq *jawa*" /T 2>nul'
  ];

  let totalKilled = 0;

  commands.forEach((cmd) => {
    try {
      exec(cmd, (error, stdout, stderr) => {
        if (!error && stdout.includes('SUCCESS')) {
          totalKilled++;
        }
      });
    } catch (error) {
      // Ignore errors
    }
  });

  setTimeout(() => {
    if (totalKilled === 0) {
      console.log(chalk.gray('ℹ  No JAWA processes found running\n'));
      console.log(chalk.yellow('💡 Tip: You can also manually stop via Task Manager\n'));
    } else {
      console.log(chalk.green(`\n✅ Successfully stopped processes\n`));
    }
  }, 1500);
}

module.exports = stopCommand;
