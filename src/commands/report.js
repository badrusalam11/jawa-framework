const { exec } = require('child_process');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');

async function reportCommand(options) {
  // Find the latest report directory
  const reportsBaseDir = 'reports';
  
  if (!await fs.pathExists(reportsBaseDir)) {
    console.log(chalk.red('❌ No reports directory found\n'));
    console.log(chalk.yellow('Run a test first with: jawa run\n'));
    process.exit(1);
  }

  // Get all report directories
  const entries = await fs.readdir(reportsBaseDir);
  const reportDirs = entries.filter(entry => entry.startsWith('report-'));
  
  if (reportDirs.length === 0) {
    console.log(chalk.red('❌ No reports found\n'));
    console.log(chalk.yellow('Run a test first with: jawa run\n'));
    process.exit(1);
  }

  // Sort by timestamp (newest first)
  reportDirs.sort().reverse();
  const latestReport = reportDirs[0];
  const reportDir = path.join(reportsBaseDir, latestReport);
  const indexFile = path.join(reportDir, 'index.html');

  // Check if index.html exists
  if (!await fs.pathExists(indexFile)) {
    console.log(chalk.red(`❌ Report index.html not found in: ${latestReport}\n`));
    console.log(chalk.yellow('The report might be corrupted. Run the test again.\n'));
    process.exit(1);
  }

  console.log(chalk.blue('🌐 Opening latest HTML report in browser...\n'));
  console.log(chalk.gray(`  Report: ${latestReport}`));
  console.log(chalk.gray(`  Path  : ${path.resolve(indexFile)}\n`));

  // Detect OS and open browser accordingly
  let command;
  switch (process.platform) {
    case 'darwin': // macOS
      command = `open "${indexFile}"`;
      break;
    case 'win32': // Windows
      command = `start "" "${indexFile}"`;
      break;
    default: // Linux and others
      command = `xdg-open "${indexFile}"`;
      break;
  }

  exec(command, (error) => {
    if (error) {
      console.log(chalk.red('❌ Failed to open browser'));
      console.log(chalk.yellow(`\nPlease open manually: ${path.resolve(indexFile)}\n`));
    } else {
      console.log(chalk.green('✅ Report opened in browser!\n'));
      
      // Show available reports
      if (reportDirs.length > 1) {
        console.log(chalk.cyan(`📂 Available reports (${reportDirs.length} total):`));
        reportDirs.slice(0, 5).forEach((dir, index) => {
          const marker = index === 0 ? chalk.green('  ✓ ') : '    ';
          console.log(chalk.gray(marker + dir));
        });
        if (reportDirs.length > 5) {
          console.log(chalk.gray(`    ... and ${reportDirs.length - 5} more\n`));
        } else {
          console.log('');
        }
      }
    }
  });
}

module.exports = reportCommand;
