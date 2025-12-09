# JAWA Framework - New Workflow Guide

## 🚀 Refactored with Professional Features

JAWA sekarang menggunakan **workflow profesional** yang mirip dengan script bash production-grade, tapi **100% JavaScript** dan **cross-platform** (macOS & Windows).

---

## ✨ What's New?

### 1. **Timestamp-Based Reports**
Setiap run menghasilkan folder terpisah dengan timestamp:
```
reports/
  ├── report-20241209-143022/
  ├── report-20241209-145530/
  └── report-20241209-151045/

results/
  ├── result-20241209-143022/
  ├── result-20241209-145530/
  └── result-20241209-151045/
```

### 2. **Auto ZIP Archives**
Hasil test otomatis di-zip untuk easy sharing:
```
report-zips/
  ├── report-20241209-143022.zip
  ├── report-20241209-145530.zip
  └── report-20241209-151045.zip

result-zips/
  ├── result-20241209-143022.zip
  ├── result-20241209-145530.zip
  └── result-20241209-151045.zip
```

### 3. **New CLI Parameters**
```bash
jawa run --loop=<count> --user=<threads> --ramp=<seconds>
```

**Examples:**
```bash
# Simple: 1 user, 1 loop, 1 second ramp-up
jawa run --loop=1 --user=1 --ramp=1

# Medium load: 10 users, 5 loops, 2 seconds ramp-up
jawa run --loop=5 --user=10 --ramp=2

# Heavy load: 100 users, 10 loops, 10 seconds ramp-up
jawa run --loop=10 --user=100 --ramp=10

# With duration (time-based instead of loop-based)
jawa run --user=50 --ramp=5 --duration=60
```

### 4. **Dynamic Memory Allocation**
Default: **3GB heap** (production-grade)
```bash
# Custom memory (for very large tests)
jawa run --loop=10 --user=100 --heap=4g

# Low memory environment
jawa run --loop=1 --user=5 --heap=1g
```

### 5. **Cross-Platform Support**
- ✅ macOS
- ✅ Windows
- ✅ Linux

No more `.sh` files! Pure JavaScript dengan `spawn` dan platform detection.

---

## 📋 Complete Workflow

### 1. Initialize Project
```bash
jawa init my-perf-test
cd my-perf-test
```

### 2. Run Test
```bash
# Quick test
jawa run --loop=1 --user=1 --ramp=1

# Load test
jawa run --loop=10 --user=50 --ramp=5

# Stress test with custom memory
jawa run --loop=20 --user=100 --ramp=10 --heap=4g
```

### 3. View Report
```bash
# Opens latest report automatically
jawa report
```

---

## 🎯 Command Reference

### `jawa init <project-name>`
Create new JAWA project

**Options:**
- `-t, --template <type>` - Template type: `basic`, `advanced`, `lightweight` (default: `basic`)

**Examples:**
```bash
jawa init my-test
jawa init load-test --template lightweight
```

---

### `jawa run`
Run JMeter performance test

**Options:**
- `-l, --loop <number>` - Loop count for each thread (default: 1)
- `-u, --user <number>` - Number of users/threads (default: 1)
- `-r, --ramp <seconds>` - Ramp-up period in seconds (default: 1)
- `-d, --duration <seconds>` - Test duration in seconds, 0 = loop-based (default: 0)
- `--base-url <url>` - Base URL for testing (default: http://localhost:8080)
- `--heap <memory>` - JVM heap memory, e.g., 3g, 2048m (default: 3g)
- `-g, --gui` - Open JMeter GUI mode
- `-f, --file <path>` - Test file path (default: main.jmx)

**Examples:**
```bash
# Basic test
jawa run --loop=1 --user=1 --ramp=1

# Load test dengan 50 concurrent users
jawa run --loop=5 --user=50 --ramp=10

# Time-based test (run for 60 seconds)
jawa run --user=20 --ramp=5 --duration=60

# Custom base URL
jawa run --loop=1 --user=10 --base-url=https://api.example.com

# High memory for large results
jawa run --loop=100 --user=500 --heap=8g

# Open GUI to inspect test plan
jawa run --gui
```

---

### `jawa report`
Open latest HTML report in browser

**Examples:**
```bash
jawa report
```

---

## 📊 Output Structure

```
my-perf-test/
├── main.jmx                          # JMeter test plan
├── user.properties                   # User-defined properties
├── jmeter.properties                 # JMeter configuration
├── result.csv                        # Temp result file (moved after test)
│
├── reports/
│   ├── report-20241209-143022/       # HTML dashboard
│   │   ├── index.html
│   │   ├── content/
│   │   └── user.properties           # Copied from root
│   └── report-20241209-145530/
│
├── results/
│   ├── result-20241209-143022/
│   │   └── view-results-in-table.csv
│   └── result-20241209-145530/
│
├── jmeter_logs/
│   ├── jmeter-20241209-143022.log
│   └── jmeter-20241209-145530.log
│
├── report-zips/
│   ├── report-20241209-143022.zip    # Archived HTML reports
│   └── report-20241209-145530.zip
│
└── result-zips/
    ├── result-20241209-143022.zip    # Archived CSV results
    └── result-20241209-145530.zip
```

---

## 🔥 Key Improvements vs Old Version

| Feature | Old Version | New Version |
|---------|-------------|-------------|
| Report storage | Single `reports/html` (overwritten) | `reports/report-{timestamp}` (preserved) |
| Result files | `reports/results.jtl` (overwritten) | `results/result-{timestamp}/` (preserved) |
| Memory | Fixed 2GB | Configurable (default 3GB) |
| CLI params | `--threads`, `--rampup` | `--user`, `--ramp`, `--loop` |
| ZIP archives | ❌ No | ✅ Yes (automatic) |
| Properties copy | ❌ No | ✅ Yes (to report folder) |
| Cross-platform | ⚠️  bash script issues | ✅ Pure JS (works everywhere) |
| Report generation | Separate step (often stuck) | ✅ Integrated with `-e -o` flags |
| Progress tracking | Dots animation | ✅ Live JMeter output |

---

## 💡 Pro Tips

### 1. Loop vs Duration
```bash
# Loop-based (recommended for API tests)
jawa run --loop=10 --user=5

# Duration-based (recommended for endurance tests)
jawa run --duration=300 --user=10  # Run for 5 minutes
```

### 2. Memory Sizing Guide
- **Small tests** (< 10 users, < 10 loops): `--heap=1g`
- **Medium tests** (10-50 users, 10-100 loops): `--heap=2g`
- **Large tests** (50-100 users, > 100 loops): `--heap=3g` (default)
- **Very large tests** (> 100 users): `--heap=4g` or higher

### 3. Avoid "Tidying Up" Stuck
The new workflow uses **JMeter's native report generation** (`-e -o`) which is:
- ✅ **Faster** (generates while running)
- ✅ **More reliable** (no separate step)
- ✅ **Memory efficient** (controlled by `--heap`)

**Why the old command got stuck:**
```bash
# OLD: Two-step process (prone to hanging)
jmeter -n -t main.jmx -l results.jtl           # Step 1: Run test
jmeter -g results.jtl -o report/               # Step 2: Generate (STUCK HERE!)

# NEW: One-step process (integrated)
jmeter -n -t main.jmx -l result.csv -e -o report-{timestamp}/  # All in one!
```

### 4. Sharing Results
Just share the ZIP files:
```bash
# Slack, email, or upload to cloud
report-zips/report-20241209-143022.zip
result-zips/result-20241209-143022.zip
```

Recipient extracts and opens `report-20241209-143022/index.html` directly.

---

## 🛠️ Troubleshooting

### "tidying up..." Stuck
This should **NOT happen** with the new workflow because report generation is integrated.

If it still happens:
1. Check memory: `--heap=4g`
2. Use lightweight template: `jawa init test --template lightweight`

### Report Not Generated
Check the log file:
```bash
cat jmeter_logs/jmeter-{timestamp}.log
```

### High Memory Usage
Reduce load or use lightweight template:
```bash
jawa run --loop=1 --user=10 --heap=1g
```

---

## 🎉 Summary

**Old workflow problems:**
- ❌ Reports overwritten every run
- ❌ Manual ZIP creation
- ❌ Report generation stuck/timeout
- ❌ Platform-specific scripts

**New workflow benefits:**
- ✅ All reports preserved with timestamps
- ✅ Auto ZIP for easy sharing
- ✅ Integrated report generation (no stuck)
- ✅ Pure JavaScript (cross-platform)
- ✅ Professional CLI parameters (`--loop`, `--user`, `--ramp`)
- ✅ Configurable memory (`--heap`)

**Ready to use:**
```bash
cd my-project
jawa run --loop=5 --user=10 --ramp=2
jawa report
```

🚀 **Happy Load Testing!**
