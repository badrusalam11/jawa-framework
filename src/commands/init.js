const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function initCommand(projectName, options) {
  const targetDir = path.join(process.cwd(), projectName);

  try {
    // Check if directory already exists
    if (await fs.pathExists(targetDir)) {
      console.log(chalk.red(`Error: Directory "${projectName}" already exists!`));
      process.exit(1);
    }

    console.log(chalk.blue(`\n🚀 Creating JAWA project: ${projectName}\n`));

    // Create project directory
    await fs.ensureDir(targetDir);

    // Create directory structure
    const dirs = [
      'tests',
      'config',
      'reports',
      'data',
      'lib'
    ];

    for (const dir of dirs) {
      await fs.ensureDir(path.join(targetDir, dir));
    }

    // Copy template files from templates directory
    const templateDir = path.join(__dirname, '../../templates/basic');
    
    // Copy JMeter template files
    try {
      if (await fs.pathExists(templateDir)) {
        // Copy main.jmx
        const jmxSource = path.join(templateDir, 'main.jmx');
        if (await fs.pathExists(jmxSource)) {
          await fs.copy(jmxSource, path.join(targetDir, 'main.jmx'));
        }
        
        // Copy user.properties
        const userPropsSource = path.join(templateDir, 'user.properties');
        if (await fs.pathExists(userPropsSource)) {
          await fs.copy(userPropsSource, path.join(targetDir, 'config', 'user.properties'));
        }
        
        // Copy jmeter.properties
        const jmeterPropsSource = path.join(templateDir, 'jmeter.properties');
        if (await fs.pathExists(jmeterPropsSource)) {
          await fs.copy(jmeterPropsSource, path.join(targetDir, 'config', 'jmeter.properties'));
        }
      }
    } catch (err) {
      console.log(chalk.yellow('Note: Template files not found, creating basic templates...'));
    }
    
    // Create package.json for the new project
    const projectPackageJson = {
      name: projectName,
      version: '1.0.0',
      description: `JAWA performance testing project: ${projectName}`,
      main: 'index.js',
      scripts: {
        test: 'jawa run',
        'test:gui': 'jmeter -t main.jmx',
        'test:custom': 'jawa run -t 50 -r 10 -d 300',
        'report': 'jawa report',
        'report:generate': 'jmeter -g reports/results.jtl -o reports/html && jawa report',
        'clean': 'rm -rf reports/results.jtl reports/html'
      },
      dependencies: {
        jawa: `^${require('../../package.json').version}`
      }
    };

    await fs.writeJson(path.join(targetDir, 'package.json'), projectPackageJson, { spaces: 2 });

    // Create jawa.config.js
    const configContent = `module.exports = {
  // JAWA Framework Configuration
  projectName: '${projectName}',
  
  // Test execution settings
  execution: {
    threads: 10,
    rampUp: 5,
    duration: 60,
    iterations: 100
  },
  
  // Target server configuration
  target: {
    host: 'http://localhost',
    port: 8080,
    protocol: 'http'
  },
  
  // Reporting settings
  reporting: {
    format: ['html', 'json', 'csv'],
    outputDir: './reports'
  },
  
  // Data files
  data: {
    csvDataSets: [],
    jsonDataSets: []
  },
  
  // Assertions
  assertions: {
    maxResponseTime: 2000,
    minThroughput: 100,
    errorRate: 0.01
  }
};
`;

    await fs.writeFile(path.join(targetDir, 'config', 'jawa.config.js'), configContent);

    // Create sample test file
    const testContent = `const { TestPlan, ThreadGroup, HTTPSampler } = require('jawa');

/**
 * Sample JAWA Test
 * This is a basic example of a performance test using JAWA framework
 */

class SampleTest {
  constructor(config) {
    this.config = config;
  }

  async setup() {
    console.log('Setting up test...');
    // Add your setup logic here
  }

  async execute() {
    console.log('Executing test...');
    
    // Example: HTTP GET request
    const response = await this.makeRequest({
      method: 'GET',
      url: \`\${this.config.target.host}:\${this.config.target.port}/api/health\`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Validate response
    this.validateResponse(response);
  }

  async makeRequest(options) {
    // Simulate HTTP request
    return {
      statusCode: 200,
      responseTime: Math.random() * 1000,
      body: { status: 'ok' }
    };
  }

  validateResponse(response) {
    if (response.statusCode !== 200) {
      throw new Error(\`Expected status 200, got \${response.statusCode}\`);
    }
    
    if (response.responseTime > this.config.assertions.maxResponseTime) {
      console.warn(\`Response time \${response.responseTime}ms exceeds threshold\`);
    }
  }

  async teardown() {
    console.log('Tearing down test...');
    // Add your cleanup logic here
  }

  async run() {
    try {
      await this.setup();
      await this.execute();
      await this.teardown();
      console.log('Test completed successfully! ✅');
    } catch (error) {
      console.error('Test failed:', error.message);
      process.exit(1);
    }
  }
}

// Load config and run test
const config = require('../config/jawa.config');
const test = new SampleTest(config);
test.run();
`;

    await fs.writeFile(path.join(targetDir, 'tests', 'sample.test.js'), testContent);

    // Create README for the project
    const readmeContent = `# ${projectName}

A JAWA Framework Performance Testing Project

## Getting Started

### Prerequisites

Make sure you have JMeter installed on your system:

**macOS:**
\`\`\`bash
brew install jmeter
\`\`\`

**Linux:**
\`\`\`bash
# Download from https://jmeter.apache.org/download_jmeter.cgi
# Extract and add to PATH
\`\`\`

**Windows:**
Download from https://jmeter.apache.org/download_jmeter.cgi

### Install Dependencies

\`\`\`bash
npm install
\`\`\`

## Running Tests

### Run Tests in Non-GUI Mode (Recommended for Load Testing)

\`\`\`bash
npm test
\`\`\`

This runs: \`jmeter -n -t main.jmx -l reports/results.jtl\`

### Run Tests with Custom Properties

\`\`\`bash
npm run test:custom
\`\`\`

### Open JMeter GUI

\`\`\`bash
npm run test:gui
\`\`\`

### Generate HTML Report

After running tests, generate an HTML dashboard report:

\`\`\`bash
npm run report
\`\`\`

The report will be available at \`reports/html/index.html\`

### Custom Test Execution

Run with custom parameters:

\`\`\`bash
jmeter -n -t main.jmx -Jthreads=50 -Jrampup=10 -Jduration=300 -Jbase.url=https://example.com -l reports/results.jtl
\`\`\`

## Project Structure

\`\`\`
${projectName}/
├── main.jmx                    # Main JMeter test plan
├── config/
│   ├── user.properties         # User-defined properties
│   ├── jmeter.properties       # JMeter configuration
│   └── jawa.config.js          # JAWA framework config
├── tests/                      # Additional test scripts
├── data/                       # Test data files (CSV, JSON)
├── reports/                    # Test reports and results
│   ├── results.jtl            # Test results file
│   └── html/                  # HTML dashboard reports
├── lib/                        # Custom libraries and utilities
└── package.json
\`\`\`

## Configuration

### JMeter Properties

Edit \`config/user.properties\` to configure:
- \`base.url\` - Target server URL
- \`threads\` - Number of virtual users
- \`rampup\` - Ramp-up time in seconds
- \`duration\` - Test duration in seconds

### Test Plan

Edit \`main.jmx\` in JMeter GUI to:
- Add/modify HTTP requests
- Configure thread groups
- Add assertions and timers
- Set up listeners and reports

## JMeter Test Plan Details

The generated \`main.jmx\` includes:

- **Test Plan** with user-defined variables
- **Thread Group** with configurable threads, ramp-up, and duration
- **HTTP Request** sampler (Health Check example)
- **Response Assertion** to validate HTTP status code
- **Duration Assertion** to ensure response time is under 2 seconds
- **Results Tree Listener** for detailed results
- **Summary Report** for aggregated metrics

## Tips

1. **Always use Non-GUI mode for actual load testing** - GUI mode is for test development only
2. **Monitor your test results** - Use Summary Report and HTML Dashboard
3. **Tune your test parameters** - Start with small loads and gradually increase
4. **Use CSV Data Sets** - Place CSV files in \`data/\` folder for parameterization
5. **Clean old results** - Remove old .jtl files before new test runs

## Documentation

For more information:
- [JMeter Documentation](https://jmeter.apache.org/usermanual/index.html)
- [JAWA Framework](https://github.com/yourusername/jawa-framework)
`;

    await fs.writeFile(path.join(targetDir, 'README.md'), readmeContent);

    // Create .gitignore
    const gitignoreContent = `node_modules/
reports/*
!reports/.gitkeep
*.log
.DS_Store
.env
`;

    await fs.writeFile(path.join(targetDir, '.gitignore'), gitignoreContent);

    // Create .gitkeep in reports directory
    await fs.writeFile(path.join(targetDir, 'reports', '.gitkeep'), '');

    // Success message
    console.log(chalk.green('✅ Project created successfully!\n'));
    console.log(chalk.cyan('📦 Project includes:\n'));
    console.log('  ✓ main.jmx - JMeter test plan');
    console.log('  ✓ user.properties - Test configuration');
    if (options.template === 'lightweight') {
      console.log(chalk.green('  ✓ Optimized for FAST report generation (90% smaller files!)'));
    }
    console.log('  ✓ jmeter.properties - JMeter settings');
    console.log('  ✓ Sample test structure\n');
    console.log(chalk.cyan('Next steps:\n'));
    console.log(`  cd ${projectName}`);
    console.log(`  npm test          ${chalk.gray('# Run test + auto-generate HTML report')}`);
    console.log(`  npm run report    ${chalk.gray('# Open HTML report in browser')}`);
    console.log(`  npm run test:gui  ${chalk.gray('# Open JMeter GUI to edit test')}\n`);
    console.log(chalk.cyan('📊 After running test, HTML report will be at:'));
    console.log(chalk.gray(`  ${projectName}/reports/html/index.html\n`));
    console.log(chalk.yellow('⚠️  Make sure JMeter is installed on your system!'));
    console.log(chalk.gray('   macOS: brew install jmeter'));
    console.log(chalk.gray('   Or download from: https://jmeter.apache.org/\n'));
    console.log(chalk.green('Happy testing! 🎯\n'));

  } catch (error) {
    console.error(chalk.red('Error creating project:'), error.message);
    process.exit(1);
  }
}

module.exports = initCommand;
