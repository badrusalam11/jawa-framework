const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function statsCommand(options) {
  const csvFile = options.file;
  
  if (!csvFile) {
    console.log(chalk.red('❌ Please specify CSV file: jawa stats --file=results/result.csv'));
    process.exit(1);
  }

  if (!await fs.pathExists(csvFile)) {
    console.log(chalk.red(`❌ File not found: ${csvFile}`));
    process.exit(1);
  }

  console.log(chalk.blue('\n📊 Analyzing JMeter Results...\n'));
  console.log(chalk.gray('═'.repeat(60)));

  // Read CSV file
  const content = await fs.readFile(csvFile, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length < 2) {
    console.log(chalk.red('❌ CSV file is empty or invalid'));
    process.exit(1);
  }

  // Parse header
  const headers = lines[0].split(',');
  const timeStampIdx = headers.indexOf('timeStamp');
  const elapsedIdx = headers.indexOf('elapsed');
  const labelIdx = headers.indexOf('label');
  const successIdx = headers.indexOf('success');
  const responseCodeIdx = headers.indexOf('responseCode');

  if (timeStampIdx === -1 || elapsedIdx === -1) {
    console.log(chalk.red('❌ Invalid CSV format: missing timeStamp or elapsed columns'));
    process.exit(1);
  }

  // Parse data
  const requests = [];
  let successCount = 0;
  let failCount = 0;
  let totalElapsed = 0;
  const labelStats = {};

  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',');
    const timeStamp = parseInt(fields[timeStampIdx]);
    const elapsed = parseInt(fields[elapsedIdx]);
    const label = fields[labelIdx] || 'Unknown';
    const success = fields[successIdx] === 'true';
    const responseCode = fields[responseCodeIdx];

    if (isNaN(timeStamp) || isNaN(elapsed)) continue;

    requests.push({
      timeStamp,
      elapsed,
      label,
      success,
      responseCode,
      endTime: timeStamp + elapsed
    });

    totalElapsed += elapsed;
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Per-label statistics
    if (!labelStats[label]) {
      labelStats[label] = {
        count: 0,
        success: 0,
        fail: 0,
        totalElapsed: 0,
        min: Infinity,
        max: 0
      };
    }
    
    labelStats[label].count++;
    labelStats[label].totalElapsed += elapsed;
    labelStats[label].min = Math.min(labelStats[label].min, elapsed);
    labelStats[label].max = Math.max(labelStats[label].max, elapsed);
    
    if (success) {
      labelStats[label].success++;
    } else {
      labelStats[label].fail++;
    }
  }

  if (requests.length === 0) {
    console.log(chalk.red('❌ No valid requests found in CSV'));
    process.exit(1);
  }

  // Calculate metrics
  const totalRequests = requests.length;
  const startTime = Math.min(...requests.map(r => r.timeStamp));
  const endTime = Math.max(...requests.map(r => r.endTime));
  const durationMs = endTime - startTime;
  const durationSec = durationMs / 1000;
  const avgElapsed = totalElapsed / totalRequests;
  
  // RPS Calculation
  const rps = durationSec > 0 ? (totalRequests / durationSec) : 0;
  
  // Error rate
  const errorRate = ((failCount / totalRequests) * 100).toFixed(2);

  // Calculate percentiles (90th, 95th, 99th)
  const sortedElapsed = requests.map(r => r.elapsed).sort((a, b) => a - b);
  const p90 = sortedElapsed[Math.floor(sortedElapsed.length * 0.90)];
  const p95 = sortedElapsed[Math.floor(sortedElapsed.length * 0.95)];
  const p99 = sortedElapsed[Math.floor(sortedElapsed.length * 0.99)];

  // Display overall statistics
  console.log(chalk.cyan('📈 Overall Statistics:'));
  console.log(chalk.gray(`  Total Requests    : ${totalRequests.toLocaleString()}`));
  console.log(chalk.green(`  Success           : ${successCount.toLocaleString()}`));
  console.log(chalk.red(`  Failed            : ${failCount.toLocaleString()}`));
  console.log(chalk.yellow(`  Error Rate        : ${errorRate}%`));
  console.log(chalk.gray(`  Test Duration     : ${durationSec.toFixed(2)}s`));
  console.log(chalk.cyan(`  RPS (Req/sec)     : ${rps.toFixed(2)}`));
  console.log(chalk.gray(`  Avg Response Time : ${avgElapsed.toFixed(2)}ms`));
  console.log(chalk.gray(`  Min Response Time : ${Math.min(...sortedElapsed)}ms`));
  console.log(chalk.gray(`  Max Response Time : ${Math.max(...sortedElapsed)}ms`));
  console.log(chalk.gray(`  90th Percentile   : ${p90}ms`));
  console.log(chalk.gray(`  95th Percentile   : ${p95}ms`));
  console.log(chalk.gray(`  99th Percentile   : ${p99}ms`));
  console.log(chalk.gray('═'.repeat(60)));

  // Display per-label statistics
  console.log(chalk.cyan('\n📊 Per-Label Statistics:\n'));
  
  Object.keys(labelStats).forEach(label => {
    const stats = labelStats[label];
    const avgResp = stats.totalElapsed / stats.count;
    const successRate = ((stats.success / stats.count) * 100).toFixed(2);
    
    console.log(chalk.yellow(`  ${label}:`));
    console.log(chalk.gray(`    Requests      : ${stats.count.toLocaleString()}`));
    console.log(chalk.gray(`    Success Rate  : ${successRate}%`));
    console.log(chalk.gray(`    Avg Time      : ${avgResp.toFixed(2)}ms`));
    console.log(chalk.gray(`    Min Time      : ${stats.min}ms`));
    console.log(chalk.gray(`    Max Time      : ${stats.max}ms`));
    console.log();
  });

  console.log(chalk.gray('═'.repeat(60)));
  console.log(chalk.green('✅ Analysis complete!\n'));
}

module.exports = statsCommand;
