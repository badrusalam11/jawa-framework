# JAWA Framework 🎯

**JavaScript Wrapper for Apache JMeter**

JAWA (JavaScript Apache Wrapper for JMeter) is a CLI tool that simplifies JMeter project setup and execution. Initialize JMeter test projects with a single command and manage your performance tests using familiar npm workflows.

## Features

- 🚀 Quick JMeter project initialization with starter templates
- 📦 Generates complete JMeter test structure (`.jmx`, properties files)
- ⚡ Run JMeter tests via simple CLI commands
- 📊 Automatic HTML report generation
- 🛠️ Configurable test parameters (threads, ramp-up, duration)
- 📝 Pre-configured test plans with best practices
- 🎨 Beautiful console output and progress tracking
- 🔧 Easy integration with npm scripts

## Prerequisites

**JMeter must be installed on your system:**

### macOS
\`\`\`bash
brew install jmeter
\`\`\`

### Linux
Download from [Apache JMeter](https://jmeter.apache.org/download_jmeter.cgi) and add to PATH

### Windows
Download from [Apache JMeter](https://jmeter.apache.org/download_jmeter.cgi) and add to PATH

Verify installation:
\`\`\`bash
jmeter --version
\`\`\`

## Installation

### Global Installation (Recommended)

Install JAWA globally to use the CLI from anywhere:

\`\`\`bash
npm install -g jawa
\`\`\`

### Local Installation

Or install it locally in your project:

\`\`\`bash
npm install jawa
\`\`\`

## Quick Start

### 1. Create a New JMeter Project

\`\`\`bash
jawa init my-performance-tests
\`\`\`

This will create a complete JMeter project with:

\`\`\`
my-performance-tests/
├── main.jmx                    # JMeter test plan
├── config/
│   ├── user.properties         # User-defined test properties
│   ├── jmeter.properties       # JMeter configuration
│   └── jawa.config.js          # JAWA framework config
├── tests/                      # Additional test scripts
├── data/                       # CSV/JSON test data
├── reports/                    # Test results and HTML reports
├── lib/                        # Custom libraries
├── package.json
└── README.md
\`\`\`

### 2. Navigate to Your Project

\`\`\`bash
cd my-performance-tests
\`\`\`

### 3. Run Your First Test

Run JMeter test (automatically generates HTML report):
\`\`\`bash
npm test
\`\`\`

This will:
- Execute the JMeter test in non-GUI mode
- Save results to `reports/results.jtl`
- Automatically generate HTML dashboard at `reports/html/`
- Show you the report location

### 4. View HTML Report

Open the generated HTML report in your browser:
\`\`\`bash
npm run report
\`\`\`

Or manually open: `reports/html/index.html`

The report includes:
- 📊 Test statistics and graphs
- ⏱️ Response times and throughput
- ✅ Success/failure rates
- 📈 Over time graphs
- 🎯 Detailed metrics per request

## Configuration

### User Properties (`config/user.properties`)

Edit to customize test parameters:

\`\`\`properties
# Target Configuration
base.url=http://localhost:8080

# Load Configuration
threads=10
rampup=5
duration=60

# HTTP Configuration
http.connection.timeout=30000
http.response.timeout=30000
\`\`\`

### JMeter Test Plan (`main.jmx`)

The generated test plan includes:
- ✅ Configurable thread groups
- ✅ HTTP request samplers
- ✅ Response assertions (status code)
- ✅ Duration assertions (response time < 2s)
- ✅ Summary report listener
- ✅ Results tree listener

Edit `main.jmx` in JMeter GUI to customize:
\`\`\`bash
npm run test:gui
\`\`\`

## HTML Dashboard Reports

After running tests with `npm test` or `jawa run`, an HTML dashboard report is automatically generated at `reports/html/index.html`.

### Report Contents

The HTML report includes:

- **📊 Dashboard Overview** - Summary statistics and key metrics
- **📈 Over Time Graphs** - Response times, throughput, active threads
- **📉 Throughput** - Requests per second over time
- **⏱️ Response Times** - Min, max, avg, percentiles (90%, 95%, 99%)
- **✅ Success Rate** - Percentage of successful requests
- **📋 Statistics Table** - Detailed metrics per request
- **❌ Error Analysis** - Failed requests and error messages

### Viewing Reports

\`\`\`bash
# Method 1: Use JAWA command (opens in browser)
npm run report

# Method 2: Use JAWA CLI directly
jawa report

# Method 3: Open manually
open reports/html/index.html  # macOS
xdg-open reports/html/index.html  # Linux
start reports/html/index.html  # Windows
\`\`\`

### Report Directory Structure

\`\`\`
reports/
├── results.jtl              # Raw test results (CSV format)
└── html/                    # HTML Dashboard
    ├── index.html          # Main report page
    ├── content/            # Report content and assets
    └── sbadmin2-1.0.7/     # UI framework
\`\`\`

## Working with JMeter Test Plans

### Editing Tests

1. Open JMeter GUI:
   \`\`\`bash
   npm run test:gui
   \`\`\`

2. Modify your test plan:
   - Add HTTP requests
   - Configure thread groups
   - Add assertions and validators
   - Set up timers and logic controllers
   - Add CSV data sets from `data/` folder

3. Save and run:
   \`\`\`bash
   npm test
   \`\`\`

### Adding HTTP Requests

In JMeter GUI:
1. Right-click on Thread Group → Add → Sampler → HTTP Request
2. Configure server name/IP, port, protocol, and path
3. Add request parameters, headers, or body data
4. Add assertions to validate responses

### Using CSV Data Sets

1. Place CSV files in `data/` folder
2. In JMeter GUI: Thread Group → Add → Config Element → CSV Data Set Config
3. Configure filename and variable names
4. Reference variables in HTTP requests as `${variable_name}`

## CLI Commands

### Initialize a New Project

\`\`\`bash
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
