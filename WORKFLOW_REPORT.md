# JAWA Framework - Complete Workflow dengan HTML Report

## 🎯 Overview

Setelah update terbaru, JAWA framework sekarang **otomatis generate HTML report** setelah test selesai, persis seperti yang kamu mau!

## 📊 Workflow Lengkap

### 1. Buat Project Baru

\`\`\`bash
jawa init my-load-test
cd my-load-test
\`\`\`

### 2. Run Test

\`\`\`bash
npm test
\`\`\`

**Ini akan otomatis:**
1. ✅ Jalankan JMeter test
2. ✅ Save results ke `reports/results.jtl`
3. ✅ Generate HTML dashboard ke `reports/html/`
4. ✅ Tampilkan lokasi report

Output yang akan kamu lihat:
\`\`\`
🚀 Running JMeter test: main.jmx
Command: jmeter -n -t main.jmx ...

[JMeter output...]

✅ Test completed successfully!

📊 Generating HTML dashboard report...

[Report generation...]

✅ HTML report generated successfully!

📁 Report location:
  /path/to/project/reports/html/index.html

🌐 Open report with:
  open reports/html/index.html
  # or
  jawa report
\`\`\`

### 3. Buka Report di Browser

Ada 3 cara:

**Cara 1: Pakai npm script (Recommended)**
\`\`\`bash
npm run report
\`\`\`

**Cara 2: Pakai JAWA CLI**
\`\`\`bash
jawa report
\`\`\`

**Cara 3: Buka manual**
\`\`\`bash
open reports/html/index.html  # macOS
\`\`\`

## 📊 HTML Report Contents

Report yang di-generate akan punya struktur seperti screenshot yang kamu kirim:

\`\`\`
reports/
└── report-2025-11-12T09-38-43_007Z/
    ├── content/
    │   └── ... (charts, data, assets)
    ├── sbadmin2-1.0.7/
    │   └── ... (UI framework)
    ├── index.html
    └── statistics.json
\`\`\`

### Report Includes:

1. **📊 Dashboard** - Overview dengan key metrics
   - Total requests
   - Success rate
   - Average response time
   - Throughput (req/sec)

2. **📈 Over Time Graphs**
   - Response time over time
   - Active threads
   - Bytes throughput
   - Latencies

3. **📉 Response Times Distribution**
   - Min, Max, Average
   - Percentiles (50%, 90%, 95%, 99%)
   - Standard deviation

4. **📋 Statistics Table**
   - Per-request breakdown
   - Label, #Samples, Average, Min, Max
   - Error %, Throughput, Sent/Received KB/sec

5. **❌ Errors Analysis**
   - Error types
   - Error messages
   - Failed requests details

6. **🔍 Top 5 Errors**
   - Most common errors
   - Error count and percentage

## 🛠️ Customization

### Custom Test Parameters

\`\`\`bash
# Jalankan dengan parameter custom
jawa run -t 50 -r 10 -d 300 -u https://api.example.com
\`\`\`

Atau edit `config/user.properties`:
\`\`\`properties
base.url=https://api.example.com
threads=50
rampup=10
duration=300
\`\`\`

Lalu run:
\`\`\`bash
npm test
\`\`\`

### Edit Test Plan

\`\`\`bash
# Buka JMeter GUI untuk edit test
npm run test:gui
\`\`\`

Modify:
- Add more HTTP requests
- Add assertions
- Add timers
- Add data from CSV

Save, then run:
\`\`\`bash
npm test
\`\`\`

## 📝 Available npm Scripts

\`\`\`json
{
  "scripts": {
    "test": "jawa run",                                    // Run test + auto HTML report
    "test:gui": "jmeter -t main.jmx",                     // Open JMeter GUI
    "test:custom": "jawa run -t 50 -r 10 -d 300",        // Run dengan custom params
    "report": "jawa report",                              // Open HTML report di browser
    "report:generate": "jmeter -g ... && jawa report",    // Manual generate + open
    "clean": "rm -rf reports/results.jtl reports/html"   // Clean old reports
  }
}
\`\`\`

## 🎯 Complete Example

### Scenario: Load Test untuk REST API

\`\`\`bash
# 1. Create project
jawa init api-load-test
cd api-load-test

# 2. Edit config/user.properties
cat > config/user.properties <<EOF
base.url=https://jsonplaceholder.typicode.com
threads=20
rampup=10
duration=120
EOF

# 3. Edit main.jmx (optional)
npm run test:gui
# Modify HTTP request ke /posts, /users, dll
# Save and close

# 4. Run test
npm test

# Output:
# ✅ Test completed successfully!
# 📊 Generating HTML dashboard report...
# ✅ HTML report generated successfully!
# 📁 Report location: /Users/.../reports/html/index.html

# 5. Open report
npm run report
# Browser akan buka otomatis!
\`\`\`

## 🔄 Workflow Recommendations

### Development/Testing
\`\`\`bash
npm run test:gui   # Edit test di GUI
npm test           # Quick test dengan default params
npm run report     # Review results
\`\`\`

### Production Load Test
\`\`\`bash
# Clean old reports
npm run clean

# Run heavy load test
jawa run -t 100 -r 30 -d 600 -u https://production.com

# Review results
npm run report
\`\`\`

### CI/CD Integration
\`\`\`bash
# In CI pipeline
npm install -g jawa
jawa init ci-test
cd ci-test
npm test

# Upload reports/html/ as artifact
# Or send reports/statistics.json to monitoring
\`\`\`

## 🐛 Troubleshooting

### Report tidak ke-generate

**Problem:** Test selesai tapi report tidak ada

**Solution:**
\`\`\`bash
# Manual generate
jmeter -g reports/results.jtl -o reports/html
jawa report
\`\`\`

### Report error/corrupt

**Problem:** Report folder ada tapi index.html error

**Solution:**
\`\`\`bash
# Clean and re-run
npm run clean
npm test
\`\`\`

### Browser tidak auto-open

**Problem:** `jawa report` tidak buka browser

**Solution:**
\`\`\`bash
# Open manual
open reports/html/index.html  # macOS
xdg-open reports/html/index.html  # Linux
start reports/html/index.html  # Windows
\`\`\`

## 🎉 Summary

**Before:**
\`\`\`bash
npm test                                    # Run test
jmeter -g results.jtl -o reports/html      # Manual generate
open reports/html/index.html               # Manual open
\`\`\`

**Now (After Update):**
\`\`\`bash
npm test        # Run test + AUTO generate HTML report!
npm run report  # Auto open in browser!
\`\`\`

**Lebih simple, lebih cepat, lebih mantap! 🚀**

---

Created with ❤️ for Performance Testing
