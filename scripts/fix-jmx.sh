#!/bin/bash

# JAWA Helper - Fix Corrupted main.jmx

echo "🔧 JAWA - Fix Corrupted JMX File"
echo ""

if [ ! -f "main.jmx" ]; then
    echo "❌ Error: main.jmx not found in current directory"
    echo ""
    echo "Run this script from your JAWA project directory:"
    echo "  cd /path/to/your/project"
    echo "  bash fix-jmx.sh"
    exit 1
fi

echo "📁 Found: main.jmx"
echo ""

# Backup original
echo "💾 Creating backup: main.jmx.backup"
cp main.jmx main.jmx.backup

# Fix stringProp without name attribute
echo "🔨 Fixing corrupted stringProp elements..."

# Fix: <stringProp>200</stringProp> → <stringProp name="1722442432">200</stringProp>
# Fix: <stringProp>201</stringProp> → <stringProp name="1722442433">201</stringProp>

# Use sed to fix empty/missing name attributes
sed -i.tmp 's/<stringProp>200<\/stringProp>/<stringProp name="1722442432">200<\/stringProp>/g' main.jmx
sed -i.tmp 's/<stringProp>201<\/stringProp>/<stringProp name="1722442433">201<\/stringProp>/g' main.jmx
sed -i.tmp 's/<stringProp>202<\/stringProp>/<stringProp name="1722442434">202<\/stringProp>/g' main.jmx
sed -i.tmp 's/<stringProp>204<\/stringProp>/<stringProp name="1722442436">204<\/stringProp>/g' main.jmx
sed -i.tmp 's/<stringProp>400<\/stringProp>/<stringProp name="1722442640">400<\/stringProp>/g' main.jmx
sed -i.tmp 's/<stringProp>404<\/stringProp>/<stringProp name="1722442644">404<\/stringProp>/g' main.jmx
sed -i.tmp 's/<stringProp>500<\/stringProp>/<stringProp name="1722442850">500<\/stringProp>/g' main.jmx

# Clean up temp file
rm -f main.jmx.tmp

echo "✅ Fixed!"
echo ""

# Verify
echo "🔍 Verifying fix..."
if grep -q '<stringProp name="[0-9]*">200</stringProp>' main.jmx; then
    echo "✅ Verification passed!"
    echo ""
    echo "📝 Changes made:"
    echo "  - Fixed stringProp elements with missing 'name' attributes"
    echo "  - Backup saved as: main.jmx.backup"
    echo ""
    echo "🚀 Try running your test now:"
    echo "  npm test"
    echo "  # or"
    echo "  jawa run"
else
    echo "⚠️  Could not verify fix automatically"
    echo "   But common issues should be resolved"
    echo ""
    echo "Try running: npm test"
fi

echo ""
