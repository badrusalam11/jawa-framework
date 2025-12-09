# JAWA 🚀# JAWA Framework 🎯



**JavaScript Apache Wrapper for JMeter**



A modern CLI tool to simplify JMeter performance testing. Initialize projects, run tests, and view reports with simple commands.**JavaScript Apache Wrapper for JMeter****JavaScript Wrapper for Apache JMeter**



[![npm version](https://img.shields.io/npm/v/jawa.svg)](https://www.npmjs.com/package/jawa)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Simplify JMeter performance testing with a modern CLI tool. Initialize projects, run tests, and view reports with simple commands.JAWA (JavaScript Apache Wrapper for JMeter) is a CLI tool that simplifies JMeter project setup and execution. Initialize JMeter test projects with a single command and manage your performance tests using familiar npm workflows.

---



## 📦 Installation

---## Features

```bash

npm install -g jawa

```

## Installation- 🚀 Quick JMeter project initialization with starter templates

**Verify installation:**

```bash- 📦 Generates complete JMeter test structure (`.jmx`, properties files)

jawa --version

``````bash- ⚡ Run JMeter tests via simple CLI commands



---npm install -g jawa- 📊 Automatic HTML report generation



## ⚡ Prerequisites```- 🛠️ Configurable test parameters (threads, ramp-up, duration)



**JMeter must be installed:**- 📝 Pre-configured test plans with best practices



```bashVerify:- 🎨 Beautiful console output and progress tracking

# macOS

brew install jmeter```bash- 🔧 Easy integration with npm scripts



# Linux/Windowsjawa --version

# Download from: https://jmeter.apache.org

``````## Prerequisites



**Verify JMeter:**

```bash

jmeter --version---**JMeter must be installed on your system:**

```



---

## Prerequisites### macOS

## 🚀 Quick Start

\`\`\`bash

### 1️⃣ Create New Project

**JMeter must be installed:**brew install jmeter

```bash

jawa init my-project\`\`\`

cd my-project

``````bash



**Generated structure:**# macOS### Linux

```

my-project/brew install jmeterDownload from [Apache JMeter](https://jmeter.apache.org/download_jmeter.cgi) and add to PATH

├── main.jmx              # JMeter test plan

├── config/

│   └── user.properties   # Test configuration

├── reports/              # HTML reports (timestamped)# Linux/Windows### Windows

├── results/              # Test results (CSV)

├── jmeter_logs/          # JMeter logs# Download from https://jmeter.apache.org/Download from [Apache JMeter](https://jmeter.apache.org/download_jmeter.cgi) and add to PATH

├── report-zips/          # Archived reports

└── result-zips/          # Archived results```

```

Verify installation:

### 2️⃣ Run Test

Verify:\`\`\`bash

```bash

jawa run --loop=1 --user=1 --ramp=1```bashjmeter --version

```

jmeter --version\`\`\`

### 3️⃣ View Report

```

```bash

jawa report## Installation

```

---

Opens the latest HTML report in your browser.

### Global Installation (Recommended)

---

## Quick Start

## 📖 Commands

Install JAWA globally to use the CLI from anywhere:

### `jawa init <project-name>`

### 1. Create New Project

Initialize a new JAWA project with JMeter test template.

\`\`\`bash

**Example:**

```bash```bashnpm install -g jawa

jawa init my-load-test

```jawa init my-project\`\`\`



---cd my-project



### `jawa run [options]````### Local Installation



Run JMeter performance test.



**Options:**Creates:Or install it locally in your project:



| Option | Description | Default |```

|--------|-------------|---------|

| `-l, --loop <number>` | Loop count per user | `1` |my-project/\`\`\`bash

| `-u, --user <number>` | Number of concurrent users | `1` |

| `-r, --ramp <seconds>` | Ramp-up period in seconds | `1` |├── main.jmx              # JMeter test plannpm install jawa

| `-d, --duration <seconds>` | Test duration (0 = loop-based) | `0` |

| `--heap <memory>` | JVM heap memory | `3g` |├── config/\`\`\`

| `--base-url <url>` | Override base URL | `http://localhost:8080` |

| `-g, --gui` | Open JMeter GUI | `false` |│   └── user.properties   # Test configuration

| `-f, --file <path>` | Test file path | `main.jmx` |

├── reports/              # HTML reports (timestamped)## Quick Start

**Examples:**

├── results/              # Test results (CSV)

```bash

# Quick test├── jmeter_logs/          # JMeter logs### 1. Create a New JMeter Project

jawa run --loop=1 --user=1 --ramp=1

├── report-zips/          # Archived reports

# Load test

jawa run --loop=10 --user=50 --ramp=5└── result-zips/          # Archived results\`\`\`bash



# Stress test with more memory```jawa init my-performance-tests

jawa run --loop=20 --user=100 --ramp=10 --heap=4g

\`\`\`

# Time-based test (run for 5 minutes)

jawa run --user=20 --ramp=5 --duration=300### 2. Run Test



# Custom base URLThis will create a complete JMeter project with:

jawa run --loop=5 --user=10 --base-url=https://api.example.com

``````bash



---jawa run --loop=1 --user=1 --ramp=1\`\`\`



### `jawa report````my-performance-tests/



Open the latest HTML report in your browser.├── main.jmx                    # JMeter test plan



**Example:****Parameters:**├── config/

```bash

jawa report- `--loop` - Loop count per user (default: 1)│   ├── user.properties         # User-defined test properties

```

- `--user` - Number of concurrent users (default: 1)│   ├── jmeter.properties       # JMeter configuration

---

- `--ramp` - Ramp-up period in seconds (default: 1)│   └── jawa.config.js          # JAWA framework config

## 🎯 Features

- `--heap` - JVM memory (default: 3g)├── tests/                      # Additional test scripts

✅ **Timestamped Reports** - Every run creates a separate report folder  

✅ **Auto ZIP Archives** - Results automatically compressed for sharing  ├── data/                       # CSV/JSON test data

✅ **Integrated Report Generation** - No separate steps, no hanging  

✅ **Cross-Platform** - Works on macOS, Windows, Linux  **Examples:**├── reports/                    # Test results and HTML reports

✅ **Dynamic Memory** - Configurable heap size for large tests  

✅ **Professional Output** - Clean console logs with progress tracking```bash├── lib/                        # Custom libraries



---# Quick test├── package.json



## 📁 Output Structurejawa run --loop=1 --user=1 --ramp=1└── README.md



After running tests, your project will have:\`\`\`



```# Load test

my-project/

├── reports/jawa run --loop=10 --user=50 --ramp=5### 2. Navigate to Your Project

│   ├── report-20241209-143022/    # HTML dashboard

│   └── report-20241209-145530/

├── results/

│   ├── result-20241209-143022/    # CSV results# Stress test with more memory\`\`\`bash

│   └── result-20241209-145530/

├── jmeter_logs/jawa run --loop=20 --user=100 --ramp=10 --heap=4gcd my-performance-tests

│   └── jmeter-20241209-143022.log

├── report-zips/                    # Shareable archives```\`\`\`

│   └── report-20241209-143022.zip

└── result-zips/

    └── result-20241209-143022.zip

```### 3. View Report### 3. Run Your First Test



**Benefits:**

- All reports are preserved (no overwriting)

- ZIP files ready for sharing```bashRun JMeter test (automatically generates HTML report):

- Timestamped for easy tracking

jawa report\`\`\`bash

---

```npm test

## 🔧 Configuration

\`\`\`

### Memory Sizing Guide

Opens the latest HTML report in your browser.

| Users | Recommended Heap |

|-------|------------------|This will:

| 1-10 | `--heap=1g` |

| 10-50 | `--heap=2g` |---- Execute the JMeter test in non-GUI mode

| 50-100 | `--heap=3g` (default) |

| 100+ | `--heap=4g` or higher |- Save results to `reports/results.jtl`



### Loop vs Duration## Commands- Automatically generate HTML dashboard at `reports/html/`



**Loop-based (recommended for API tests):**- Show you the report location

```bash

jawa run --loop=10 --user=5### `jawa init <project-name>`

```

Initialize new JAWA project with JMeter test template.### 4. View HTML Report

**Time-based (recommended for endurance tests):**

```bash

jawa run --duration=300 --user=10  # Run for 5 minutes

```### `jawa run [options]`Open the generated HTML report in your browser:



### Edit Test PlanRun JMeter performance test.\`\`\`bash



Open JMeter GUI to customize your test:npm run report

```bash

jawa run --gui**Options:**\`\`\`

```

- `-l, --loop <number>` - Loop count (default: 1)

Or edit `main.jmx` directly with any text editor.

- `-u, --user <number>` - Number of users (default: 1)Or manually open: `reports/html/index.html`

---

- `-r, --ramp <seconds>` - Ramp-up time (default: 1)

## 🛠️ Workflow

- `-d, --duration <seconds>` - Test duration in seconds (default: 0 = loop-based)The report includes:

```bash

# 1. Create project- `--heap <memory>` - JVM heap memory (default: 3g)- 📊 Test statistics and graphs

jawa init load-test

cd load-test- `--base-url <url>` - Override base URL- ⏱️ Response times and throughput



# 2. Edit test plan (optional)- `-g, --gui` - Open JMeter GUI- ✅ Success/failure rates

jawa run --gui

- 📈 Over time graphs

# 3. Run test

jawa run --loop=5 --user=10 --ramp=2### `jawa report`- 🎯 Detailed metrics per request



# 4. View resultsOpen latest HTML report in browser.

jawa report

## Configuration

# 5. Share results

# Send: report-zips/report-TIMESTAMP.zip---

```

### User Properties (`config/user.properties`)

---

## Features

## 🐛 Troubleshooting

Edit to customize test parameters:

### JMeter Not Found

✅ **Timestamped Reports** - Every run creates separate report folder  

```bash

# Install JMeter first✅ **Auto ZIP Archives** - Results automatically compressed for sharing  \`\`\`properties

brew install jmeter  # macOS

```✅ **Integrated Report Generation** - No separate steps, no hanging  # Target Configuration



### Out of Memory✅ **Cross-Platform** - Works on macOS, Windows, Linux  base.url=http://localhost:8080



```bash✅ **Dynamic Memory** - Configurable heap size for large tests  

# Increase heap size

jawa run --heap=4g --loop=10 --user=50✅ **Professional Output** - Clean console logs with progress tracking  # Load Configuration

```

threads=10

### Report Not Generated

---rampup=5

Check the log file:

```bashduration=60

cat jmeter_logs/jmeter-TIMESTAMP.log

```## Output Structure



### Test Fails to Start# HTTP Configuration



Ensure `main.jmx` is valid:```http.connection.timeout=30000

```bash

jawa run --guimy-project/http.response.timeout=30000

```

├── reports/\`\`\`

---

│   ├── report-20241209-143022/    # HTML dashboard

## 📚 Documentation

│   └── report-20241209-145530/### JMeter Test Plan (`main.jmx`)

- **Workflow Guide:** [NEW_WORKFLOW.md](./NEW_WORKFLOW.md)

- **GitHub Issues:** [Report a bug](https://github.com/badrusalam11/jawa-framework/issues)├── results/

- **GitHub Discussions:** [Ask questions](https://github.com/badrusalam11/jawa-framework/discussions)

│   ├── result-20241209-143022/    # CSV resultsThe generated test plan includes:

---

│   └── result-20241209-145530/- ✅ Configurable thread groups

## 🤝 Contributing

├── jmeter_logs/- ✅ HTTP request samplers

Contributions are welcome! Please feel free to submit a Pull Request.

│   └── jmeter-20241209-143022.log- ✅ Response assertions (status code)

1. Fork the repository

2. Create your feature branch (`git checkout -b feature/amazing-feature`)├── report-zips/                    # Shareable archives- ✅ Duration assertions (response time < 2s)

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)│   └── report-20241209-143022.zip- ✅ Summary report listener

5. Open a Pull Request

└── result-zips/- ✅ Results tree listener

---

    └── result-20241209-143022.zip

## 📄 License

```Edit `main.jmx` in JMeter GUI to customize:

MIT © [badrusalam11](https://github.com/badrusalam11)

\`\`\`bash

---

---npm run test:gui

## ⭐ Support

\`\`\`

If you find JAWA helpful, please give it a star on [GitHub](https://github.com/badrusalam11/jawa-framework)!

## Workflow

---

## HTML Dashboard Reports

**Made with ❤️ for performance testers**

```bash

# 1. Create projectAfter running tests with `npm test` or `jawa run`, an HTML dashboard report is automatically generated at `reports/html/index.html`.

jawa init load-test

cd load-test### Report Contents



# 2. Edit test plan (optional)The HTML report includes:

jawa run --gui

- **📊 Dashboard Overview** - Summary statistics and key metrics

# 3. Run test- **📈 Over Time Graphs** - Response times, throughput, active threads

jawa run --loop=5 --user=10 --ramp=2- **📉 Throughput** - Requests per second over time

- **⏱️ Response Times** - Min, max, avg, percentiles (90%, 95%, 99%)

# 4. View results- **✅ Success Rate** - Percentage of successful requests

jawa report- **📋 Statistics Table** - Detailed metrics per request

- **❌ Error Analysis** - Failed requests and error messages

# 5. Share results

# Just send: report-zips/report-TIMESTAMP.zip### Viewing Reports

```

\`\`\`bash

---# Method 1: Use JAWA command (opens in browser)

npm run report

## Tips

# Method 2: Use JAWA CLI directly

### Memory Sizingjawa report

- **1-10 users:** `--heap=1g`

- **10-50 users:** `--heap=2g`# Method 3: Open manually

- **50-100 users:** `--heap=3g` (default)open reports/html/index.html  # macOS

- **100+ users:** `--heap=4g` or higherxdg-open reports/html/index.html  # Linux

start reports/html/index.html  # Windows

### Loop vs Duration\`\`\`

```bash

# Loop-based (recommended for API tests)### Report Directory Structure

jawa run --loop=10 --user=5

\`\`\`

# Time-based (endurance tests)reports/

jawa run --duration=300 --user=10  # 5 minutes├── results.jtl              # Raw test results (CSV format)

```└── html/                    # HTML Dashboard

    ├── index.html          # Main report page

### Custom Test Plans    ├── content/            # Report content and assets

Edit `main.jmx` with JMeter GUI:    └── sbadmin2-1.0.7/     # UI framework

```bash\`\`\`

jawa run --gui

```## Working with JMeter Test Plans



---### Editing Tests



## Troubleshooting1. Open JMeter GUI:

   \`\`\`bash

### JMeter Not Found   npm run test:gui

```bash   \`\`\`

# Install JMeter first

brew install jmeter  # macOS2. Modify your test plan:

```   - Add HTTP requests

   - Configure thread groups

### Out of Memory   - Add assertions and validators

```bash   - Set up timers and logic controllers

# Increase heap size   - Add CSV data sets from `data/` folder

jawa run --heap=4g --loop=10 --user=50

```3. Save and run:

   \`\`\`bash

### Report Not Generated   npm test

Check log file:   \`\`\`

```bash

cat jmeter_logs/jmeter-TIMESTAMP.log### Adding HTTP Requests

```

In JMeter GUI:

---1. Right-click on Thread Group → Add → Sampler → HTTP Request

2. Configure server name/IP, port, protocol, and path

## License3. Add request parameters, headers, or body data

4. Add assertions to validate responses

MIT

### Using CSV Data Sets

---

1. Place CSV files in `data/` folder

## Support2. In JMeter GUI: Thread Group → Add → Config Element → CSV Data Set Config

3. Configure filename and variable names

- 📖 Documentation: [NEW_WORKFLOW.md](./NEW_WORKFLOW.md)4. Reference variables in HTTP requests as `${variable_name}`

- 🐛 Issues: [GitHub Issues](https://github.com/badrusalam11/jawa-framework/issues)

- 💬 Discussions: [GitHub Discussions](https://github.com/badrusalam11/jawa-framework/discussions)## CLI Commands



---### Initialize a New Project



**Made with ❤️ for performance testers**\`\`\`bash

jawa init <project-name> [options]
\`\`\`

**Options:**
- `-t, --template <type>` - Template type: `basic`, `lightweight`, or `advanced` (default: `basic`)

**Templates:**
- `basic` - Full data collection (default)
- `lightweight` - **90% smaller files, 10x faster reports!** ⚡ (Recommended for production)
- `advanced` - Multiple requests (GET + POST)

**Examples:**
\`\`\`bash
# Default (full details)
jawa init my-tests

# Lightweight (fast reports, no stuck issues!)
jawa init my-tests --template lightweight

# Advanced (multiple requests)
jawa init my-tests --template advanced
\`\`\`

See [TEMPLATE_COMPARISON.md](TEMPLATE_COMPARISON.md) for detailed comparison.

### Run JMeter Test

\`\`\`bash
jawa run [options]
\`\`\`

**Options:**
- `-f, --file <path>` - JMeter test file (default: `main.jmx`)
- `-o, --output <path>` - Output results file (default: `reports/results.jtl`)
- `-t, --threads <number>` - Number of threads (default: `10`)
- `-r, --rampup <seconds>` - Ramp-up period (default: `5`)
- `-d, --duration <seconds>` - Test duration (default: `60`)
- `-u, --base-url <url>` - Base URL (default: `http://localhost:8080`)
- `-g, --gui` - Open JMeter GUI

**Examples:**
\`\`\`bash
# Run with default settings (auto-generates HTML report)
jawa run

# Run with custom parameters
jawa run -t 50 -r 10 -d 300 -u https://example.com

# Open JMeter GUI
jawa run --gui
\`\`\`

### Open HTML Report

\`\`\`bash
jawa report [options]
\`\`\`

**Options:**
- `-d, --dir <path>` - Report directory (default: `reports/html`)

**Example:**
\`\`\`bash
# Open report in browser
jawa report

# Open report from custom directory
jawa report -d custom-reports/html
\`\`\`

### View Help

\`\`\`bash
jawa --help
jawa init --help
jawa run --help
\`\`\`

### Check Version

\`\`\`bash
jawa --version
\`\`\`

## API Reference

### TestPlan

Creates a test plan container for organizing thread groups.

\`\`\`javascript
const { TestPlan } = require('jawa');

const plan = new TestPlan('My Test Plan', config);
plan.addThreadGroup(threadGroup);
await plan.run();
\`\`\`

### ThreadGroup

Defines a group of virtual users executing the same test logic.

\`\`\`javascript
const { ThreadGroup } = require('jawa');

const group = new ThreadGroup('Users', {
  threads: 10,
  rampUp: 5,
  iterations: 100
});
\`\`\`

### HTTPSampler

Performs HTTP requests.

\`\`\`javascript
const { HTTPSampler } = require('jawa');

const sampler = new HTTPSampler('Get Users', {
  method: 'GET',
  url: 'http://localhost:8080/api/users',
  headers: { 'Content-Type': 'application/json' }
});
\`\`\`

### Assertion

Validates response data.

\`\`\`javascript
const { Assertion } = require('jawa');

const assertion = new Assertion('responseCode', 200);
const isValid = assertion.validate(response);
\`\`\`

## Publishing to npm

To publish this framework to npm (for package maintainers):

1. Create an npm account at [npmjs.com](https://www.npmjs.com)

2. Login to npm:
   \`\`\`bash
   npm login
   \`\`\`

3. Publish the package:
   \`\`\`bash
   npm publish
   \`\`\`

Note: The package name "jawa" must be available on npm. If it's taken, you'll need to choose a different name or scope it (e.g., `@yourname/jawa`).

## Development

### Project Structure

\`\`\`
jawa-framework/
├── bin/
│   └── jawa.js           # CLI entry point
├── src/
│   ├── index.js          # Main framework code
│   └── commands/
│       └── init.js       # Init command implementation
├── package.json
└── README.md
\`\`\`

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Link locally: `npm link`
4. Test the CLI: `jawa --help`

## Troubleshooting

### Report Generation Stuck/Hanging

If report generation hangs or takes too long:

**Quick fix:**
\`\`\`bash
# Kill stuck process
pkill -9 jmeter

# Run test again
npm test
\`\`\`

**For large result files:**
\`\`\`bash
# Generate with more memory
jmeter -Xmx4g -g reports/results.jtl -o reports/html
\`\`\`

**Use helper script:**
\`\`\`bash
# Auto-detects file size and uses optimal settings
./scripts/fix-stuck-report.sh
\`\`\`

See [JMETER_STUCK_FIX.md](JMETER_STUCK_FIX.md) for detailed troubleshooting.

### Other Issues

- **JMeter not found:** Install with `brew install jmeter` (macOS)
- **Report not found:** Run `npm test` first
- **Results file empty:** Check test configuration in `config/user.properties`

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/yourusername/jawa-framework).

---

Made with ❤️ for the performance testing community
