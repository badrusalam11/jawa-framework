#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');
const initCommand = require('../src/commands/init');
const runCommand = require('../src/commands/run');
const reportCommand = require('../src/commands/report');

program
  .name('jawa')
  .description('A JavaScript-based JMeter framework for performance testing')
  .version(packageJson.version);

program
  .command('init <project-name>')
  .description('Initialize a new JAWA project with JMeter test files')
  .action((projectName) => {
    initCommand(projectName, {});
  });

program
  .command('run')
  .description('Run JMeter test')
  .option('-e, --env <environment>', 'Target environment (dev, prod, uat, etc)')
  .option('-f, --file <path>', 'JMeter test file (.jmx)', 'plan/main.jmx')
  .option('-l, --loop <number>', 'Loop count for each thread', '1')
  .option('-u, --user <number>', 'Number of users (threads)', '1')
  .option('-r, --ramp <seconds>', 'Ramp-up period in seconds', '1')
  .option('-d, --duration <seconds>', 'Test duration in seconds (0 = run loop count)', '0')
  .option('--base-url <url>', 'Base URL for testing', 'http://localhost:8080')
  .option('-g, --gui', 'Open JMeter GUI', false)
  .option('--heap <memory>', 'JVM heap memory (e.g., 3g, 2048m)', '3g')
  .option('--web', 'Launch web UI for interactive test configuration', false)
  .option('-p, --port <number>', 'Port for web UI server (default: 7247 or from .env)')
  .action(async (options) => {
    if (options.web) {
      const WebServer = require('../src/web/server');
      const open = require('open');
      // Only pass port if explicitly specified by user
      const port = options.port ? parseInt(options.port) : null;
      const server = new WebServer(port);
      await server.start();
      
      // Auto-open browser
      setTimeout(() => {
        open(`http://localhost:${server.port}`);
      }, 1000);
      
      // Keep server running
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n\n👋 Shutting down server...\n'));
        server.stop();
        process.exit(0);
      });
    } else {
      runCommand(options);
    }
  });

program
  .command('report')
  .description('Open latest HTML test report in browser')
  .action(() => {
    reportCommand();
  });

program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
