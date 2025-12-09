# JAWA 🚀

**JavaScript Apache Wrapper for JMeter**

A modern CLI tool to simplify JMeter performance testing. Initialize projects, run tests, and view reports with simple commands.

[![npm version](https://img.shields.io/npm/v/jawa.svg)](https://www.npmjs.com/package/jawa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📦 Installation

```bash
npm install -g jawa-framework
```

Verify installation:
```bash
jawa --version
```

---

## ⚡ Prerequisites

JMeter must be installed on your system:

```bash
# macOS
brew install jmeter

# Linux/Windows
# Download from: https://jmeter.apache.org
```

Verify JMeter:
```bash
jmeter --version
```

---

## 🚀 Quick Start

### 1️⃣ Create New Project

```bash
jawa init my-project
cd my-project
```

Generated structure:
```
my-project/
├── .env                     # Environment configuration
├── plan/
│   └── main.jmx            # JMeter test plan
├── prop/
│   ├── dev/                # Dev environment properties
│   │   ├── user.properties
│   │   └── jmeter.properties
│   ├── prod/               # Production environment properties
│   │   ├── user.properties
│   │   └── jmeter.properties
│   └── uat/                # UAT environment properties
│       ├── user.properties
│       └── jmeter.properties
├── data/
│   ├── dev/                # Dev test data (CSV files)
│   ├── prod/               # Prod test data (CSV files)
│   └── uat/                # UAT test data (CSV files)
├── reports/                # HTML reports (timestamped)
├── results/                # Test results (timestamped)
└── lib/                    # Custom JMeter plugins
```

### 2️⃣ Configure Environment

Edit `.env` file to set target environment:
```bash
TARGET_ENV=dev
BASE_URL=http://localhost:8080
THREADS=1
RAMPUP=1
LOOP=1
```

Or customize properties per environment in `prop/dev/`, `prop/prod/`, etc.

### 3️⃣ Run Test

```bash
# Use environment from .env file
jawa run --loop=1 --user=1 --ramp=1

# Override environment via command line
jawa run --env=prod --loop=10 --user=50 --ramp=10
```

### 4️⃣ View Report

```bash
jawa report
```

Opens the latest HTML report in your browser.

---

## 📖 Commands

### jawa init

Initialize a new JAWA project with environment-based structure.

```bash
jawa init my-load-test
```

Creates project with `plan/`, `prop/[env]/`, and `data/[env]/` folders.

### jawa run

Run JMeter performance test.

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| -e, --env | Target environment (dev/prod/uat) | dev |
| -l, --loop | Loop count per user | 1 |
| -u, --user | Number of concurrent users | 1 |
| -r, --ramp | Ramp-up period in seconds | 1 |
| -d, --duration | Test duration (0 = loop-based) | 0 |
| --heap | JVM heap memory | 3g |
| --base-url | Override base URL | - |
| -g, --gui | Open JMeter GUI | false |
| -f, --file | Test file path | plan/main.jmx |

**Examples:**
```bash
# Quick test on dev
jawa run --loop=1 --user=1 --ramp=1

# Load test on production
jawa run --env=prod --loop=10 --user=50 --ramp=5

# Stress test on UAT with more memory
jawa run --env=uat --loop=20 --user=100 --ramp=10 --heap=4g

# Use environment from .env file
jawa run --loop=5 --user=10

# Time-based test (run for 5 minutes)
jawa run --user=20 --ramp=5 --duration=300

# Custom base URL
jawa run --loop=5 --user=10 --base-url=https://api.example.com
```

### jawa report

Open the latest HTML report in your browser.

```bash
jawa report
```

---

## 🎯 Features

- ✅ **Timestamped Reports** - Every run creates a separate report folder
- ✅ **Auto ZIP Archives** - Results automatically compressed for sharing
- ✅ **Integrated Report Generation** - No separate steps, no hanging
- ✅ **Cross-Platform** - Works on macOS, Windows, Linux
- ✅ **Dynamic Memory** - Configurable heap size for large tests
- ✅ **Professional Output** - Clean console logs with progress tracking

---

## 📁 Output Structure

After running tests, your project will have:

```
my-project/
├── reports/
│   ├── report-20241209-143022/
│   └── report-20241209-145530/
├── results/
│   ├── result-20241209-143022/
│   └── result-20241209-145530/
├── jmeter_logs/
│   └── jmeter-20241209-143022.log
├── report-zips/
│   └── report-20241209-143022.zip
└── result-zips/
    └── result-20241209-143022.zip
```

Benefits:
- All reports are preserved (no overwriting)
- ZIP files ready for sharing
- Timestamped for easy tracking

---

## 🔧 Configuration

### Memory Sizing Guide

| Users | Recommended Heap |
|-------|------------------|
| 1-10 | --heap=1g |
| 10-50 | --heap=2g |
| 50-100 | --heap=3g (default) |
| 100+ | --heap=4g or higher |

### Loop vs Duration

**Loop-based (recommended for API tests):**
```bash
jawa run --loop=10 --user=5
```

**Time-based (recommended for endurance tests):**
```bash
jawa run --duration=300 --user=10
```

### Edit Test Plan

Open JMeter GUI to customize your test:
```bash
jawa run --gui
```

---

## 🛠️ Workflow

```bash
# 1. Create project
jawa init load-test
cd load-test

# 2. Edit test plan (optional)
jawa run --gui

# 3. Run test
jawa run --loop=5 --user=10 --ramp=2

# 4. View results
jawa report

# 5. Share results
# Send: report-zips/report-TIMESTAMP.zip
```

---

## 🐛 Troubleshooting

### JMeter Not Found

```bash
# Install JMeter first
brew install jmeter
```

### Out of Memory

```bash
# Increase heap size
jawa run --heap=4g --loop=10 --user=50
```

### Report Not Generated

Check the log file:
```bash
cat jmeter_logs/jmeter-TIMESTAMP.log
```

### Test Fails to Start

Ensure main.jmx is valid:
```bash
jawa run --gui
```

---

## 📚 Documentation

- **Workflow Guide:** [NEW_WORKFLOW.md](./NEW_WORKFLOW.md)
- **GitHub Issues:** [Report a bug](https://github.com/badrusalam11/jawa-framework/issues)
- **GitHub Discussions:** [Ask questions](https://github.com/badrusalam11/jawa-framework/discussions)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT © [badrusalam11](https://github.com/badrusalam11)

---

## ⭐ Support

If you find JAWA helpful, please give it a star on [GitHub](https://github.com/badrusalam11/jawa-framework)!

---

**Made with ❤️ for performance testers**
