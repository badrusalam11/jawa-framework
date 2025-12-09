# JAWA Report - Troubleshooting & How It Works

## 🔍 Kenapa Report Gak Langsung Ada di JMeter?

**Q: Kenapa gak langsung include HTML Report Generator di listener JMeter?**

**A:** JMeter's HTML Report Generator **TIDAK BISA** real-time generate HTML saat test running. Ini limitasi dari JMeter sendiri.

### Cara Kerja JMeter HTML Report:

1. **Saat test running** → JMeter save raw results ke `.jtl` file (CSV format)
2. **Setelah test selesai** → Kita generate HTML dashboard dari `.jtl` file
3. **HTML report** → Baru bisa di-access

### What JAWA Does:

```bash
npm test
# 1. Run JMeter test dengan listener SimpleDataWriter
#    → Save ke reports/results.jtl
# 
# 2. Test selesai
# 
# 3. Auto-run: jmeter -g reports/results.jtl -o reports/html
#    → Generate HTML dashboard
#
# 4. Report siap!
```

## 🐛 Troubleshooting

### Problem 1: "Report not found"

```bash
$ jawa report
❌ Report not found at: reports/html
```

**Cause:** Test belum pernah di-run, atau report generation gagal

**Solution:**

```bash
# Cara 1: Run test (will auto-generate)
npm test

# Cara 2: Generate manual dari results.jtl
jmeter -g reports/results.jtl -o reports/html

# Cara 3: jawa report akan auto-detect dan generate
jawa report  # Will generate if results.jtl exists
```

### Problem 2: Report generation gagal

**Symptoms:**
```
✅ Test completed successfully!
📊 Generating HTML dashboard report...
❌ Failed to generate HTML report
```

**Possible causes:**
1. results.jtl file corrupt atau empty
2. JMeter gak bisa write ke reports/html
3. Old report folder gak bisa di-delete

**Solution:**

```bash
# Clean reports folder
npm run clean

# Or manual:
rm -rf reports/results.jtl reports/html

# Run test again
npm test
```

### Problem 3: Results.jtl empty

**Cause:** Test terlalu cepat selesai atau gak ada requests yang jalan

**Solution:**

```bash
# Check results file
cat reports/results.jtl

# Should have content like:
# timeStamp,elapsed,label,responseCode,responseMessage,threadName...
# 1702123456789,123,HTTP Request,200,OK,Thread Group 1-1...

# If empty, check test configuration:
npm run test:gui
# Verify:
# - Thread group has threads > 0
# - Duration > 0
# - HTTP requests are valid
```

## ✅ Verified Workflow

### Method 1: Simple (Recommended)

```bash
# 1. Create project
jawa init my-test
cd my-test

# 2. Run test (auto-generates report)
npm test

# Output:
# ✅ Test completed successfully!
# 📊 Generating HTML dashboard report...
# ✅ HTML report generated successfully!
# 📁 Report location: .../reports/html/index.html

# 3. Open report
npm run report
```

### Method 2: Step by Step

```bash
# 1. Run test only
jawa run

# 2. Generate report (if not auto-generated)
jmeter -g reports/results.jtl -o reports/html

# 3. Open report
jawa report
```

### Method 3: Smart Report Command

```bash
# jawa report will:
# 1. Check if reports/html/index.html exists → Open it
# 2. If not, check if reports/results.jtl exists → Generate then open
# 3. If not, show error message

jawa report
```

## 🎯 What Gets Created

```
my-project/
├── reports/
│   ├── results.jtl           # Raw CSV results (created during test)
│   └── html/                 # HTML Dashboard (created after test)
│       ├── index.html        # Main report page ← OPEN THIS!
│       ├── content/          # Charts, graphs, data
│       │   ├── js/
│       │   ├── css/
│       │   └── pages/
│       └── sbadmin2-1.0.7/   # UI framework
│           ├── css/
│           └── js/
```

## 🔧 Manual Commands

If automation fails, use these manual commands:

### Generate Report from Results

```bash
jmeter -g reports/results.jtl -o reports/html
```

### Clean Old Reports

```bash
rm -rf reports/results.jtl reports/html
```

### Run Test + Save Results

```bash
jmeter -n -t main.jmx -l reports/results.jtl
```

### Open Report

```bash
# macOS
open reports/html/index.html

# Linux
xdg-open reports/html/index.html

# Windows
start reports/html/index.html
```

## 💡 Tips

1. **Always clean old reports before new test:**
   ```bash
   npm run clean && npm test
   ```

2. **Check if JMeter is installed:**
   ```bash
   jmeter --version
   ```

3. **Verify results file after test:**
   ```bash
   ls -lh reports/results.jtl
   # Should show file size > 0
   ```

4. **If auto-generation fails, do it manually:**
   ```bash
   jmeter -g reports/results.jtl -o reports/html
   ```

5. **Use jawa report - it's smart!**
   ```bash
   jawa report  # Will generate if needed
   ```

## 📊 Expected Timeline

```
npm test → [0s] Start test
         → [5-60s] Test running (depends on duration)
         → [+1s] Test complete, saving results
         → [+2s] Generate HTML report
         → [+1s] Report ready!
         → TOTAL: ~10-65 seconds
```

## 🎉 Summary

**JAWA sudah handle everything automatically!**

Just run:
```bash
npm test        # Test + Auto-generate report
npm run report  # Open report (will generate if needed)
```

**If something fails, JAWA will tell you exactly what to do!**

---

Happy Testing! 🚀
