# JAWA Framework - Getting Started Guide

## What is JAWA?

JAWA (JavaScript Apache Wrapper for JMeter) is a CLI tool that simplifies Apache JMeter project setup and execution. It generates complete JMeter test structures with a single command.

## Quick Start

### 1. Install Prerequisites

**Install JMeter:**
```bash
# macOS
brew install jmeter

# Verify installation
jmeter --version
```

### 2. Install JAWA

```bash
# Install globally
npm install -g jawa

# Or for local development
cd /Users/computer/Documents/repository/jawa-framework
npm link
```

### 3. Create Your First Project

```bash
# Create a new JMeter project
jawa init my-load-tests

# Navigate to project
cd my-load-tests
```

### 4. Generated Project Structure

```
my-load-tests/
├── main.jmx                    # JMeter test plan (editable in GUI)
├── config/
│   ├── user.properties         # Test parameters (threads, duration, etc.)
│   ├── jmeter.properties       # JMeter settings
│   └── jawa.config.js          # JAWA config
├── tests/                      # Additional test scripts
├── data/                       # CSV/JSON test data
├── reports/                    # Test results
│   ├── results.jtl            # Raw results
│   └── html/                  # HTML dashboard
├── lib/                        # Custom utilities
├── package.json
└── README.md
```

### 5. Run Tests

**Non-GUI Mode (for actual load testing):**
```bash
npm test
```

**Open JMeter GUI (for editing):**
```bash
npm run test:gui
```

**Generate HTML Report:**
```bash
npm run report
# Opens reports/html/index.html
```

## Understanding the Generated Files

### main.jmx (JMeter Test Plan)

Contains:
- Thread Group (10 users, 5s ramp-up, 60s duration)
- HTTP Request to `/api/health`
- Response Assertion (expects HTTP 200)
- Duration Assertion (response time < 2s)
- Summary Report and Results Tree listeners

### config/user.properties

Key parameters:
```properties
base.url=http://localhost:8080
threads=10
rampup=5
duration=60
```

### package.json Scripts

- `npm test` - Run test in non-GUI mode
- `npm run test:gui` - Open JMeter GUI
- `npm run report` - Generate HTML dashboard
- `npm run test:custom` - Run with custom properties

## Editing Your Test

1. **Open JMeter GUI:**
   ```bash
   npm run test:gui
   ```

2. **Modify Test Plan:**
   - Add HTTP requests (right-click Thread Group → Add → Sampler → HTTP Request)
   - Configure endpoints, headers, body
   - Add assertions, timers, listeners
   - Save changes

3. **Run Updated Test:**
   ```bash
   npm test
   ```

## Using JAWA CLI Commands

### jawa init

Create new project:
```bash
jawa init <project-name>
```

Options:
- `-t, --template <type>` - Template type (basic/advanced)

### jawa run

Run JMeter test from anywhere:
```bash
# Default settings
jawa run

# Custom parameters
jawa run -t 50 -r 10 -d 300 -u https://api.example.com

# Open GUI
jawa run --gui
```

Options:
- `-f, --file` - JMeter file (default: main.jmx)
- `-t, --threads` - Number of threads
- `-r, --rampup` - Ramp-up period
- `-d, --duration` - Test duration
- `-u, --base-url` - Target URL
- `-g, --gui` - Open GUI mode

## Common Workflows

### Scenario 1: Quick Load Test

```bash
jawa init quick-test
cd quick-test
npm test
npm run report
```

### Scenario 2: Edit and Test

```bash
jawa init my-test
cd my-test
npm run test:gui  # Edit in GUI
# Make changes, save
npm test          # Run test
npm run report    # View results
```

### Scenario 3: Parameterized Testing

```bash
# Edit config/user.properties
# Change: threads=50, duration=300

npm run test:custom
```

### Scenario 4: Different Environments

```bash
# Development
jawa run -u http://localhost:8080 -t 10 -d 60

# Staging
jawa run -u https://staging.example.com -t 50 -d 300

# Production (be careful!)
jawa run -u https://api.example.com -t 100 -d 600
```

## Adding Test Data

### CSV Data Sets

1. Create CSV in `data/` folder:
   ```csv
   username,password
   user1,pass1
   user2,pass2
   ```

2. In JMeter GUI:
   - Thread Group → Add → Config Element → CSV Data Set Config
   - Filename: `data/users.csv`
   - Variable Names: `username,password`

3. Use in requests:
   ```
   ${username}
   ${password}
   ```

## Publishing Your Framework

To publish JAWA to npm:

```bash
# Login to npm
npm login

# Publish (from jawa-framework directory)
npm publish
```

Note: Package name must be unique on npm.

## Tips & Best Practices

1. **Always use Non-GUI mode for load testing** - GUI consumes resources
2. **Start with small loads** - Verify test works before scaling
3. **Use assertions** - Validate responses, not just send requests
4. **Monitor your test** - Watch Summary Report during execution
5. **Clean old results** - Delete old `.jtl` files before new runs
6. **Use variables** - Parameterize URLs, credentials, etc.
7. **Version control** - Commit `.jmx` and property files to git

## Troubleshooting

### JMeter not found
```bash
# Check if installed
which jmeter

# Install if missing
brew install jmeter  # macOS
```

### Test fails immediately
- Check target URL is accessible
- Verify server is running
- Check firewall/network settings

### High response times
- Check server resources
- Reduce thread count
- Increase ramp-up time

### Out of memory
- Add JMeter memory settings in `jmeter.properties`
- Reduce thread count
- Run in non-GUI mode

## Next Steps

- Read the main [README.md](README.md)
- Check [JMeter Documentation](https://jmeter.apache.org/usermanual/)
- Create custom test scenarios
- Integrate with CI/CD pipelines
- Share your test results

---

Happy Performance Testing! 🎯
