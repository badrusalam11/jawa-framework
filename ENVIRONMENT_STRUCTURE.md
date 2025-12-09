# Environment-Based Testing Structure

## Overview
JAWA Framework now supports environment-based testing with flexible configuration through `.env` file or command-line flags.

## New Folder Structure

```
project/
├── .env                        # Environment configuration
├── plan/
│   └── main.jmx               # JMeter test plan
├── prop/
│   ├── dev/                   # Development properties
│   │   ├── user.properties
│   │   └── jmeter.properties
│   ├── prod/                  # Production properties
│   │   ├── user.properties
│   │   └── jmeter.properties
│   └── uat/                   # UAT properties
│       ├── user.properties
│       └── jmeter.properties
├── data/
│   ├── dev/                   # Dev test data
│   │   └── sample-data.csv
│   ├── prod/                  # Prod test data
│   │   └── sample-data.csv
│   └── uat/                   # UAT test data
│       └── sample-data.csv
├── reports/                   # Test reports (timestamped)
├── results/                   # Test results (timestamped)
└── lib/                       # Custom plugins
```

## Configuration Methods

### 1. Using .env File (Recommended)

Edit `.env` in project root:
```bash
TARGET_ENV=dev
BASE_URL=http://localhost:8080
THREADS=10
RAMPUP=5
LOOP=10
HEAP_SIZE=3g
```

Run test (reads .env automatically):
```bash
jawa run
```

### 2. Using Command Line Flags

Override environment:
```bash
jawa run --env=prod --loop=10 --user=50 --ramp=10
```

### 3. Per-Environment Properties

Customize behavior per environment in:
- `prop/dev/user.properties` - Dev settings
- `prop/prod/user.properties` - Production settings
- `prop/uat/user.properties` - UAT settings

Each can have different:
- Base URLs
- Timeouts
- Thread counts
- Test data paths

## Environment Variables

### In .env File:
- `TARGET_ENV` - Environment to use (dev/prod/uat)
- `BASE_URL` - Server URL
- `THREADS` - Number of users
- `RAMPUP` - Ramp-up period
- `LOOP` - Loop count
- `DURATION` - Test duration
- `HEAP_SIZE` - JVM memory

### In user.properties:
- `targetEnv` - Current environment name
- `base.url` - Server URL
- `threads` - Number of threads
- `rampup` - Ramp-up time
- `duration` - Test duration

### Passed to JMeter:
- `threadTargetNumber` - Number of threads
- `threadRampUpPeriod` - Ramp-up time
- `threadLoopCount` - Iteration count
- `threadLifetimeDuration` - Test duration
- `targetEnv` - Environment name

## Usage Examples

### Development Testing
```bash
# Use dev from .env
jawa run

# Explicit dev
jawa run --env=dev --loop=1 --user=1 --ramp=1
```

### Production Testing
```bash
# Override to prod
jawa run --env=prod --loop=10 --user=50 --ramp=10

# Or update .env to TARGET_ENV=prod
echo "TARGET_ENV=prod" > .env
jawa run
```

### UAT Testing
```bash
jawa run --env=uat --loop=5 --user=20 --ramp=5
```

## NPM Scripts

Generated projects include these scripts:

```json
{
  "scripts": {
    "test": "jawa run",
    "test:dev": "jawa run --env=dev",
    "test:prod": "jawa run --env=prod",
    "test:uat": "jawa run --env=uat",
    "test:gui": "jmeter -t plan/main.jmx",
    "test:load": "jawa run --loop=10 --user=50 --ramp=10",
    "report": "jawa report",
    "clean": "rm -rf reports/* results/*"
  }
}
```

## Benefits

1. **Environment Isolation**: Separate configs for each environment
2. **Flexible Configuration**: Use .env or CLI flags
3. **Version Control**: Environment configs can be committed
4. **Data Separation**: Different test data per environment
5. **Easy Switching**: Change environment with single flag
6. **Backward Compatible**: Still works with old structure

## Migration from Old Structure

Old structure still works! If JAWA finds:
- `main.jmx` in root → uses it
- `user.properties` in root → uses it

New structure takes precedence:
- `plan/main.jmx` → preferred location
- `prop/[env]/user.properties` → environment-specific
