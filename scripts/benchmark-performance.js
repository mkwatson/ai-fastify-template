#!/usr/bin/env node
/**
 * Performance Benchmarking Script
 *
 * Validates the claimed performance improvements from the Turbo → Nx migration:
 * - Cold build: 5m → 2m (60% faster)
 * - Incremental build: 3m → 30s (6x faster)
 * - Test runs with cache: 2m → 15s (8x faster)
 * - AI feedback loop: 5m → 90s (3.3x faster)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Color output for terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

async function timeCommand(command, description) {
  console.log(`${colorize('blue', '⏱️')} ${description}...`);
  console.log(`${colorize('cyan', '💻')} Running: ${command}`);

  const startTime = Date.now();

  try {
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      cwd: process.cwd(),
    });

    const duration = Date.now() - startTime;
    console.log(
      `${colorize('green', '✅')} Completed in ${formatTime(duration)}`
    );

    return {
      success: true,
      duration,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(
      `${colorize('red', '❌')} Failed after ${formatTime(duration)}`
    );
    console.log(`${colorize('red', 'Error:')} ${error.message}`);

    return {
      success: false,
      duration,
      error: error.message,
    };
  }
}

async function clearCaches() {
  console.log(`${colorize('yellow', '🧹')} Clearing all caches...`);

  const commands = [
    'nx reset', // Clear Nx cache
    'rm -rf .nx/cache', // Extra Nx cache cleanup
    'rm -rf node_modules/.cache', // Node modules cache
    'find . -name ".tsbuildinfo" -delete', // TypeScript incremental cache
    'find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true', // Build outputs
  ];

  for (const cmd of commands) {
    try {
      await execAsync(cmd);
    } catch (error) {
      // Some cleanup commands may fail if files don't exist, that's OK
    }
  }

  console.log(`${colorize('green', '✅')} Caches cleared`);
}

async function runBenchmarks() {
  console.log(colorize('bold', '🚀 AI Fastify Template Performance Benchmark'));
  console.log(
    colorize('bold', '================================================\n')
  );

  const results = {};

  // Benchmark 1: Cold Build (everything from scratch)
  console.log(colorize('bold', '1️⃣ Cold Build Performance'));
  console.log(
    'Measures build performance with no caching (simulates CI environment)\n'
  );

  await clearCaches();
  // Ensure dependencies are installed first (not part of benchmark)
  console.log(
    `${colorize('cyan', '📦')} Ensuring dependencies are installed...`
  );
  await execAsync('pnpm install');

  results.coldBuild = await timeCommand('pnpm build', 'Cold build (no cache)');

  console.log();

  // Benchmark 2: Incremental Build (with cache)
  console.log(colorize('bold', '2️⃣ Incremental Build Performance'));
  console.log('Measures build performance with Nx caching enabled\n');

  results.incrementalBuild = await timeCommand(
    'pnpm build',
    'Incremental build (cached)'
  );

  console.log();

  // Benchmark 3: AI Quick Feedback Loop (most common during development)
  console.log(colorize('bold', '3️⃣ AI Quick Feedback Loop'));
  console.log(
    'Measures the primary AI development workflow (lint + type-check)\n'
  );

  await clearCaches();
  results.aiFeedbackCold = await timeCommand(
    'pnpm ai:quick',
    'AI quick feedback (cold)'
  );
  results.aiFeedbackCached = await timeCommand(
    'pnpm ai:quick',
    'AI quick feedback (cached)'
  );

  console.log();

  // Benchmark 4: Full Test Suite Performance
  console.log(colorize('bold', '4️⃣ Test Suite Performance'));
  console.log('Measures test execution with different caching scenarios\n');

  await clearCaches();
  results.testsCold = await timeCommand('pnpm test', 'Test suite (cold)');
  results.testsCached = await timeCommand('pnpm test', 'Test suite (cached)');

  console.log();

  // Benchmark 5: Affected Detection Performance
  console.log(colorize('bold', '5️⃣ Affected Detection Performance'));
  console.log('Measures Nx affected detection efficiency\n');

  // Create a small change to test affected detection
  const testFile = 'apps/backend-api/src/test-change.ts';
  await fs.writeFile(
    testFile,
    '// Benchmark test change\nexport const test = true;\n'
  );

  results.affectedLint = await timeCommand(
    'pnpm affected:lint --base=HEAD~1',
    'Affected lint (selective)'
  );
  results.affectedAll = await timeCommand(
    'pnpm affected:all --base=HEAD~1',
    'Affected all tasks (selective)'
  );

  // Clean up test file
  try {
    await fs.unlink(testFile);
  } catch (error) {
    // File might not exist
  }

  console.log();

  // Benchmark 6: Configuration Validation Performance
  console.log(colorize('bold', '6️⃣ Configuration Validation Performance'));
  console.log('Measures test configuration validation efficiency\n');

  results.configValidation = await timeCommand(
    'pnpm test:config:verify',
    'Config validation (full)'
  );
  results.configQuick = await timeCommand(
    'node scripts/validate-vitest-configs.js',
    'Config validation (quick)'
  );

  // Generate comprehensive report
  console.log('\n' + colorize('bold', '📊 PERFORMANCE BENCHMARK RESULTS'));
  console.log('='.repeat(50));

  const reportData = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    results: {},
  };

  // Process results and compare to claims
  const benchmarks = [
    {
      name: 'Cold Build',
      result: results.coldBuild,
      claimed: 'Build only: 5m → 2m (60% faster)',
      target: 120000, // 2 minutes in ms
    },
    {
      name: 'Incremental Build',
      result: results.incrementalBuild,
      claimed: '3m → 30s (6x faster)',
      target: 30000, // 30 seconds in ms
    },
    {
      name: 'AI Feedback (Cold)',
      result: results.aiFeedbackCold,
      claimed: '5m → 90s (3.3x faster)',
      target: 90000, // 90 seconds in ms
    },
    {
      name: 'AI Feedback (Cached)',
      result: results.aiFeedbackCached,
      claimed: '<5s (cached)',
      target: 5000, // 5 seconds in ms
    },
    {
      name: 'Tests (Cold)',
      result: results.testsCold,
      claimed: '2m → 15s (8x faster when cached)',
      target: 120000, // 2 minutes for cold
    },
    {
      name: 'Tests (Cached)',
      result: results.testsCached,
      claimed: '→ 15s (8x faster)',
      target: 15000, // 15 seconds in ms
    },
  ];

  console.log();

  let allTargetsMet = true;

  benchmarks.forEach(benchmark => {
    if (!benchmark.result.success) {
      console.log(`${colorize('red', '❌')} ${benchmark.name}: FAILED`);
      allTargetsMet = false;
      return;
    }

    const duration = benchmark.result.duration;
    const targetMet = duration <= benchmark.target;
    const status = targetMet
      ? colorize('green', '✅')
      : colorize('yellow', '⚠️');
    const comparison = targetMet ? 'MEETS TARGET' : 'EXCEEDS TARGET';

    console.log(
      `${status} ${benchmark.name}: ${formatTime(duration)} (${comparison})`
    );
    console.log(`   Claimed: ${benchmark.claimed}`);
    console.log(`   Target:  ≤${formatTime(benchmark.target)}`);
    console.log();

    if (!targetMet) allTargetsMet = false;

    reportData.results[benchmark.name.toLowerCase().replace(/[^a-z]/g, '')] = {
      duration,
      target: benchmark.target,
      targetMet,
      claimed: benchmark.claimed,
    };
  });

  // Additional insights
  if (results.aiFeedbackCached.success && results.aiFeedbackCold.success) {
    const cacheSpeedup =
      results.aiFeedbackCold.duration / results.aiFeedbackCached.duration;
    console.log(
      `${colorize('cyan', '🚀')} Cache speedup factor: ${cacheSpeedup.toFixed(1)}x`
    );
  }

  if (results.testsCached.success && results.testsCold.success) {
    const testSpeedup =
      results.testsCold.duration / results.testsCached.duration;
    console.log(
      `${colorize('cyan', '🧪')} Test cache speedup: ${testSpeedup.toFixed(1)}x`
    );
  }

  // Save detailed report
  const reportPath = path.join(
    process.cwd(),
    'performance-benchmark-report.json'
  );
  await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));

  console.log();
  console.log(`${colorize('blue', '📁')} Detailed report saved: ${reportPath}`);

  // Final assessment
  console.log('\n' + colorize('bold', '🎯 PERFORMANCE ASSESSMENT'));
  if (allTargetsMet) {
    console.log(colorize('green', '✅ ALL PERFORMANCE TARGETS MET'));
    console.log(
      colorize(
        'green',
        'The Nx migration delivered the promised performance improvements!'
      )
    );
  } else {
    console.log(colorize('yellow', '⚠️ SOME TARGETS NOT MET'));
    console.log(
      colorize(
        'yellow',
        'Performance is good but may not match all claimed improvements.'
      )
    );
    console.log(
      colorize(
        'yellow',
        'Consider further optimization or adjusting expectations.'
      )
    );
  }
}

// Run benchmarks
runBenchmarks().catch(error => {
  console.error(colorize('red', `💥 Benchmark failed: ${error.message}`));
  process.exit(1);
});
