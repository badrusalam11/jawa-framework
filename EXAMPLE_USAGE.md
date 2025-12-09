# JAWA Framework - Environment-Based Testing Examples

## Quick Start

### 1. Create New Project
```bash
jawa init my-api-test
cd my-api-test
```

### 2. Configure Environments

#### Development (.env)
```bash
TARGET_ENV=dev
BASE_URL=http://localhost:8080
THREADS=5
RAMPUP=2
LOOP=5
```

#### Development Properties (prop/dev/user.properties)
```properties
targetEnv=dev
base.url=http://localhost:8080
threads=5
rampup=2
duration=60
http.connection.timeout=10000
```

#### Production Properties (prop/prod/user.properties)
```properties
targetEnv=prod
base.url=https://api.production.com
threads=50
rampup=10
duration=300
http.connection.timeout=30000
```

### 3. Add Test Data

#### Dev Data (data/dev/users.csv)
```csv
username,password
testuser1,pass123
testuser2,pass456
```

#### Prod Data (data/prod/users.csv)
```csv
username,password
produser1,SecurePass123!
produser2,SecurePass456!
```

## Running Tests

### Local Development
```bash
# Quick smoke test
jawa run --loop=1 --user=1 --ramp=1

# Uses TARGET_ENV from .env (dev by default)
npm test

# Explicit dev environment
npm run test:dev
```

### Production Load Testing
```bash
# Override to production
jawa run --env=prod --loop=10 --user=50 --ramp=10

# Or use npm script
npm run test:prod

# Heavy load test
jawa run --env=prod --loop=20 --user=100 --ramp=20 --heap=4g
```

### UAT Testing
```bash
# Moderate load on UAT
jawa run --env=uat --loop=5 --user=20 --ramp=5

# Or use npm script
npm run test:uat
```

### Stress Testing
```bash
# Custom stress test with high memory
npm run test:load
# Runs: jawa run --loop=10 --user=50 --ramp=10
```

## Real-World Scenarios

### Scenario 1: API Health Check
```bash
# Quick health check on dev
jawa run --env=dev --loop=1 --user=1 --ramp=1

# Production health check
jawa run --env=prod --loop=1 --user=1 --ramp=1
```

### Scenario 2: Load Testing Before Release
```bash
# Step 1: Test on UAT
jawa run --env=uat --loop=10 --user=30 --ramp=5

# Step 2: View report
jawa report

# Step 3: If good, test on prod with lower load
jawa run --env=prod --loop=5 --user=10 --ramp=3
```

### Scenario 3: Gradual Load Increase
```bash
# Phase 1: Light load
jawa run --env=prod --loop=5 --user=10 --ramp=5

# Phase 2: Medium load
jawa run --env=prod --loop=10 --user=30 --ramp=10

# Phase 3: Heavy load
jawa run --env=prod --loop=20 --user=50 --ramp=15
```

### Scenario 4: CI/CD Integration
```bash
# In CI pipeline
export TARGET_ENV=uat
jawa run --loop=5 --user=10 --ramp=2

# Or explicit
jawa run --env=uat --loop=5 --user=10 --ramp=2
```

## Debug Mode

```bash
# Run test and see full JMeter command
jawa run --env=prod --loop=1 --user=1 --ramp=1

# Output shows:
# 🐛 Debug - JMeter Command:
#   jmeter -n -t plan/main.jmx -l result.csv ... -JtargetEnv=prod ...
```

## View Results

```bash
# Open latest report
jawa report

# Reports are timestamped
ls reports/
# report-20231209-143022/
# report-20231209-150145/

# Results are also timestamped and zipped
ls result-zips/
# result-20231209-143022.zip
# result-20231209-150145.zip
```

## Tips

1. **Use .env for defaults**: Set TARGET_ENV and common values
2. **Override with CLI**: Use --env=prod for quick switches
3. **Separate test data**: Keep prod data separate from dev
4. **Version control**: Commit prop/ and data/ folders
5. **Ignore sensitive data**: Add secrets to .env (gitignored)
6. **Monitor reports**: Check reports/ folder after each run
7. **Archive results**: result-zips/ and report-zips/ are auto-created

## File Organization

```
my-api-test/
├── .env                       # ⚙️  Default environment config
├── .gitignore                 # 🚫 Ignore logs, reports, zips
├── plan/
│   └── main.jmx              # 📋 Test plan (shared across envs)
├── prop/
│   ├── dev/                  # 🔧 Dev settings
│   ├── prod/                 # 🚀 Prod settings
│   └── uat/                  # 🧪 UAT settings
├── data/
│   ├── dev/                  # 📊 Dev test data
│   ├── prod/                 # 📊 Prod test data
│   └── uat/                  # 📊 UAT test data
├── reports/                  # 📈 HTML reports (timestamped)
├── results/                  # 📁 Raw results (timestamped)
├── report-zips/              # 🗜️  Archived reports
└── result-zips/              # 🗜️  Archived results
```
