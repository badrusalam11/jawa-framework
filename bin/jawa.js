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
  .option('-f, --file <path>', 'JMeter test file (.jmx)', 'main.jmx')
  .option('-l, --loop <number>', 'Loop count for each thread', '1')
  .option('-u, --user <number>', 'Number of users (threads)', '1')
  .option('-r, --ramp <seconds>', 'Ramp-up period in seconds', '1')
  .option('-d, --duration <seconds>', 'Test duration in seconds (0 = run loop count)', '0')
  .option('--base-url <url>', 'Base URL for testing', 'http://localhost:8080')
  .option('-g, --gui', 'Open JMeter GUI', false)
  .option('--heap <memory>', 'JVM heap memory (e.g., 3g, 2048m)', '3g')
  .action((options) => {
    runCommand(options);
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
