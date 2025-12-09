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

    // Create directory structure - new structure for environment-based testing
    const dirs = [
      'plan',                    // JMX test plans
      'prop/dev',               // Properties for dev environment
      'prop/prod',              // Properties for prod environment
      'prop/uat',               // Properties for uat environment
      'data/dev',               // CSV data for dev environment
      'data/prod',              // CSV data for prod environment
      'data/uat',               // CSV data for uat environment
      'reports',                // Test reports
      'results',                // Test results
      'lib'                     // Custom JMeter plugins/libraries
    ];

    for (const dir of dirs) {
      await fs.ensureDir(path.join(targetDir, dir));
    }

    // Copy template files from templates directory
    const templateDir = path.join(__dirname, '../../templates/basic');
    
    // Copy JMeter template files to new structure
    try {
      if (await fs.pathExists(templateDir)) {
        // Copy main.jmx to plan/
        const jmxSource = path.join(templateDir, 'main.jmx');
        if (await fs.pathExists(jmxSource)) {
          await fs.copy(jmxSource, path.join(targetDir, 'plan', 'main.jmx'));
        }
        
        // Copy user.properties to each environment folder
        const userPropsSource = path.join(templateDir, 'user.properties');
        if (await fs.pathExists(userPropsSource)) {
          await fs.copy(userPropsSource, path.join(targetDir, 'prop', 'dev', 'user.properties'));
          await fs.copy(userPropsSource, path.join(targetDir, 'prop', 'prod', 'user.properties'));
          await fs.copy(userPropsSource, path.join(targetDir, 'prop', 'uat', 'user.properties'));
        }
        
        // Copy jmeter.properties to each environment folder
        const jmeterPropsSource = path.join(templateDir, 'jmeter.properties');
        if (await fs.pathExists(jmeterPropsSource)) {
          await fs.copy(jmeterPropsSource, path.join(targetDir, 'prop', 'dev', 'jmeter.properties'));
          await fs.copy(jmeterPropsSource, path.join(targetDir, 'prop', 'prod', 'jmeter.properties'));
          await fs.copy(jmeterPropsSource, path.join(targetDir, 'prop', 'uat', 'jmeter.properties'));
        }
        
        // Copy .env template
        const envSource = path.join(templateDir, '.env');
        if (await fs.pathExists(envSource)) {
          await fs.copy(envSource, path.join(targetDir, '.env'));
        }
        
        // Copy sample data to each environment folder
        const sampleDataSource = path.join(templateDir, 'sample-data.csv');
        if (await fs.pathExists(sampleDataSource)) {
          await fs.copy(sampleDataSource, path.join(targetDir, 'data', 'dev', 'sample-data.csv'));
          await fs.copy(sampleDataSource, path.join(targetDir, 'data', 'prod', 'sample-data.csv'));
          await fs.copy(sampleDataSource, path.join(targetDir, 'data', 'uat', 'sample-data.csv'));
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
        'test': 'jawa run',
        'test:dev': 'jawa run --env=dev',
        'test:prod': 'jawa run --env=prod',
        'test:uat': 'jawa run --env=uat',
        'test:gui': 'jmeter -t plan/main.jmx',
        'test:load': 'jawa run --loop=10 --user=50 --ramp=10',
        'report': 'jawa report',
        'clean': 'rm -rf reports/* results/*'
      },
      dependencies: {
        jawa: `^${require('../../package.json').version}`
      }
    };

    await fs.writeJson(path.join(targetDir, 'package.json'), projectPackageJson, { spaces: 2 });

    // Create README for the project
    const readmeContent = `# ${projectName}

JAWA Framework - Performance Testing Project

## 🚀 Quick Start

### 1. Configure Environment

Edit \`.env\` file:
\`\`\`bash
TARGET_ENV=dev
BASE_URL=http://localhost:8080
THREADS=1
RAMPUP=1
LOOP=1
\`\`\`

### 2. Run Test

\`\`\`bash
# Use default environment (from .env)
npm test

# Or specify environment
npm run test:dev
npm run test:prod
npm run test:uat
\`\`\`

### 3. View Report

\`\`\`bash
npm run report
\`\`\`

## 📁 Project Structure

\`\`\`
${projectName}/
├── .env                    # Environment configuration
├── plan/
│   └── main.jmx           # JMeter test plan
├── prop/
│   ├── dev/               # Dev environment properties
│   ├── prod/              # Production properties
│   └── uat/               # UAT properties
├── data/
│   ├── dev/               # Dev test data (CSV)
│   ├── prod/              # Prod test data
│   └── uat/               # UAT test data
├── reports/               # HTML reports (timestamped)
├── results/               # Test results (timestamped)
└── lib/                   # Custom JMeter plugins
\`\`\`

## 🎯 Running Tests

\`\`\`bash
# Development environment
jawa run --env=dev --loop=1 --user=1 --ramp=1

# Production load test
jawa run --env=prod --loop=10 --user=50 --ramp=10

# UAT testing
jawa run --env=uat --loop=5 --user=20 --ramp=5

# Open JMeter GUI
jawa run --gui
\`\`\`

## ⚙️ Configuration

### Environment Properties

Edit properties per environment:
- \`prop/dev/user.properties\` - Dev settings
- \`prop/prod/user.properties\` - Production settings
- \`prop/uat/user.properties\` - UAT settings

### Test Data

Add CSV files to:
- \`data/dev/\` - Development data
- \`data/prod/\` - Production data
- \`data/uat/\` - UAT data

## 📊 Reports

Reports are timestamped and auto-generated:
- HTML reports: \`reports/report-YYYYMMDD-HHMMSS/\`
- ZIP archives: \`report-zips/report-YYYYMMDD-HHMMSS.zip\`
- Results: \`results/result-YYYYMMDD-HHMMSS/\`

## 🔧 Prerequisites

Install JMeter:
\`\`\`bash
# macOS
brew install jmeter

# Linux
sudo apt install jmeter

# Windows
choco install jmeter
\`\`\`

## 📚 Documentation

- [JAWA Framework](https://github.com/badrusalam11/jawa-framework)
- [JMeter Documentation](https://jmeter.apache.org/)
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
    console.log(chalk.cyan('📦 Project structure:\n'));
    console.log('  ✓ plan/main.jmx - JMeter test plan');
    console.log('  ✓ prop/dev/ - Development properties');
    console.log('  ✓ prop/prod/ - Production properties');
    console.log('  ✓ prop/uat/ - UAT properties');
    console.log('  ✓ data/[env]/ - Test data per environment');
    console.log('  ✓ .env - Environment configuration\n');
    console.log(chalk.cyan('Next steps:\n'));
    console.log(`  cd ${projectName}`);
    console.log(`  jawa run --env=dev --loop=1 --user=1 --ramp=1  ${chalk.gray('# Quick test')}`);
    console.log(`  jawa run --env=prod --loop=10 --user=50        ${chalk.gray('# Load test')}`);
    console.log(`  jawa report                                    ${chalk.gray('# View report')}\n`);
    console.log(chalk.cyan('📊 Environment-based testing:'));
    console.log(chalk.gray('  • Edit .env to set TARGET_ENV (dev/prod/uat)'));
    console.log(chalk.gray('  • Customize prop/[env]/user.properties per environment'));
    console.log(chalk.gray('  • Add test data to data/[env]/ folders\n'));
    console.log(chalk.yellow('⚠️  Make sure JMeter is installed!'));
    console.log(chalk.gray('   macOS: brew install jmeter'));
    console.log(chalk.gray('   Linux: sudo apt install jmeter'));
    console.log(chalk.gray('   Or: https://jmeter.apache.org/\n'));
    console.log(chalk.green('Happy testing! 🚀\n'));

  } catch (error) {
    console.error(chalk.red('Error creating project:'), error.message);
    process.exit(1);
  }
}

module.exports = initCommand;
