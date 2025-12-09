#!/bin/bash

# JAWA Helper Script - Fix Stuck Report Generation

echo "🔧 JAWA Report Fix Helper"
echo ""

# Kill stuck JMeter processes
echo "1️⃣  Killing stuck JMeter processes..."
pkill -9 jmeter 2>/dev/null
sleep 1

# Check if killed
JMETER_PROCS=$(ps aux | grep -i jmeter | grep -v grep | wc -l)
if [ "$JMETER_PROCS" -eq 0 ]; then
    echo "✅ No stuck JMeter processes found"
else
    echo "⚠️  Still have $JMETER_PROCS JMeter process(es) running"
fi

echo ""

# Check if results file exists
if [ ! -f "reports/results.jtl" ]; then
    echo "❌ No results file found at reports/results.jtl"
    echo "Run 'npm test' first to generate results"
    exit 1
fi

# Check file size
FILE_SIZE=$(du -sh reports/results.jtl | awk '{print $1}')
echo "2️⃣  Results file size: $FILE_SIZE"

# Count lines
LINE_COUNT=$(wc -l < reports/results.jtl)
echo "   Samples: $((LINE_COUNT - 1))"  # -1 for header

echo ""

# Determine memory settings based on file size
FILE_SIZE_MB=$(du -m reports/results.jtl | awk '{print $1}')

if [ "$FILE_SIZE_MB" -lt 50 ]; then
    MEM_SETTINGS="-Xmx1g -Xms256m"
    echo "3️⃣  Using standard memory settings (file < 50MB)"
elif [ "$FILE_SIZE_MB" -lt 200 ]; then
    MEM_SETTINGS="-Xmx2g -Xms512m"
    echo "3️⃣  Using medium memory settings (file 50-200MB)"
elif [ "$FILE_SIZE_MB" -lt 500 ]; then
    MEM_SETTINGS="-Xmx4g -Xms1g"
    echo "3️⃣  Using large memory settings (file 200-500MB)"
else
    MEM_SETTINGS="-Xmx8g -Xms2g"
    echo "3️⃣  Using extra-large memory settings (file > 500MB)"
    echo "⚠️  This might take several minutes..."
fi

echo ""
echo "4️⃣  Generating HTML report..."
echo "   Command: jmeter $MEM_SETTINGS -g reports/results.jtl -o reports/html"
echo ""

# Remove old report
if [ -d "reports/html" ]; then
    echo "   Removing old report..."
    rm -rf reports/html
fi

# Generate report with timeout
timeout 180 jmeter $MEM_SETTINGS -g reports/results.jtl -o reports/html

EXIT_CODE=$?

echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Report generated successfully!"
    echo ""
    echo "📁 Report location: reports/html/index.html"
    echo ""
    echo "🌐 Open with:"
    echo "   npm run report"
    echo "   # or"
    echo "   open reports/html/index.html"
elif [ $EXIT_CODE -eq 124 ]; then
    echo "❌ Report generation timeout (3 minutes)"
    echo ""
    echo "Your results file is too large ($FILE_SIZE)"
    echo ""
    echo "Options:"
    echo "1. Try with more memory:"
    echo "   jmeter -Xmx16g -g reports/results.jtl -o reports/html"
    echo ""
    echo "2. Reduce test duration in config/user.properties"
    echo ""
    echo "3. Filter results (last 100k samples):"
    echo "   tail -100000 reports/results.jtl > reports/filtered.jtl"
    echo "   jmeter -Xmx4g -g reports/filtered.jtl -o reports/html"
else
    echo "❌ Report generation failed (exit code: $EXIT_CODE)"
    echo ""
    echo "Check the error messages above"
    echo ""
    echo "Try:"
    echo "1. Clean and run test again:"
    echo "   npm run clean && npm test"
    echo ""
    echo "2. Check Java installation:"
    echo "   java -version"
fi

echo ""
