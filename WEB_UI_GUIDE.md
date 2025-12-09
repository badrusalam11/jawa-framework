# JAWA Web UI - Quick Start Guide

## 🚀 New Feature: Web UI for Test Configuration

Similar to Locust, JAWA now has a web-based interface for configuring and running tests!

## Usage

```bash
cd your-project
jawa run --web
```

This will:
1. Parse your `plan/main.jmx` file
2. Extract all Thread Groups
3. Start a web server on http://localhost:8080
4. Auto-open your browser

## Features

### 📋 Thread Group Selection
- ☑️ Visual checkboxes for each Thread Group
- Pre-checked based on JMX enabled status
- Select which groups to run

### ⚙️ Test Configuration
- **Number of Users**: Peak concurrency
- **Ramp Up Period**: Time to reach peak load
- **Test Mode**: Choose between:
  - Loop Count (run N iterations)
  - Duration (run for N seconds)

### 🔧 Advanced Options
- Add custom JMeter properties
- Override user.properties values
- Format: Key-Value pairs (like Docker env vars)

Examples:
- `timeout` = `30000`
- `apiKey` = `sk-xxxxx`
- `customVar` = `myValue`

These will be passed as `-Jtimeout=30000`, `-JapiKey=sk-xxxxx`, etc.

## How It Works

### 1. JMX Parsing
- Reads `plan/main.jmx`
- Extracts Thread Group names and enabled status
- Displays in UI

### 2. Configuration
- User selects Thread Groups
- Sets users, ramp-up, loop/duration
- Adds optional advanced properties

### 3. JMX Modification
- Creates `plan/main-mod.jmx`
- Enables only selected Thread Groups
- Disables unchecked groups

### 4. Test Execution
- Runs JMeter with modified JMX
- Passes custom properties via `-J` flags
- Shows progress in terminal

## Output

Modified JMX saved to:
```
plan/main-mod.jmx
```

Original file untouched:
```
plan/main.jmx
```

## Example Workflow

```bash
# Start web UI
jawa run --web

# Browser opens automatically
# 1. Check/uncheck Thread Groups
# 2. Set Users: 10
# 3. Set Ramp: 5
# 4. Select "Loop Count", value: 10
# 5. Add advanced: timeout = 30000
# 6. Click "START TEST"
# 7. Check terminal for progress
```

## Technical Details

### Dependencies
- `express`: Web server
- `fast-xml-parser`: JMX parsing
- `open`: Auto-open browser

### Routes
- `GET /` - Main UI
- `GET /api/thread-groups` - Get available groups
- `POST /api/start-test` - Start test with config
- `GET /api/test-status` - Check if test is running

### Files Created
- `src/web/server.js` - Express server
- `src/web/parser.js` - JMX parser
- `src/web/modifier.js` - JMX modifier
- `src/web/public/index.html` - UI
- `src/web/public/style.css` - Styling
- `src/web/public/app.js` - Frontend logic

## Screenshots

Web UI includes:
- Clean, modern interface
- Locust-inspired design
- Responsive layout
- Real-time status updates

## Tips

1. **Original JMX unchanged**: `main-mod.jmx` is temporary
2. **Terminal output**: Test progress shown in terminal
3. **Multiple runs**: Each run creates new modified JMX
4. **Advanced props**: Use for any JMeter property override
5. **Stop server**: Press Ctrl+C in terminal

## Comparison

| Feature | CLI | Web UI |
|---------|-----|--------|
| Thread Group Selection | ❌ No | ✅ Yes |
| Visual Interface | ❌ No | ✅ Yes |
| Real-time Config | ❌ No | ✅ Yes |
| Advanced Props | ✅ Via flags | ✅ Key-Value UI |
| Speed | ⚡ Fastest | 🌐 Interactive |

Use CLI for automation, Web UI for exploration!
