#!/usr/bin/env node

/**
 * Smart Turbo Pipeline - Dynamic Task Execution
 *
 * Intelligently determines which packages need to run based on changed files,
 * providing faster feedback loops while maintaining dependency integrity.
 *
 * This script integrates seamlessly with existing turbo workflows while adding
 * selective execution capabilities for improved developer productivity.
 *
 * Features:
 * - Modular architecture with separate git, config, and performance modules
 * - External configuration file support (.turbo-smart.json)
 * - Comprehensive performance metrics and timing analysis
 * - Security-first design with input validation and sanitization
 */

import { execSync } from 'child_process';
import { checkGitBase, getChangedPackages } from './lib/git-operations.js';
import { loadConfig } from './lib/config.js';
import { PerformanceMetrics, logExecutionSummary } from './lib/performance.js';

/**
 * Parse command line arguments
 */
function parseArgs(config) {
  const args = process.argv.slice(2);

  // Handle turbo run command format: smart-turbo.js run <task> [options]
  const isRunCommand = args[0] === 'run';
  const taskIndex = isRunCommand ? 1 : 0;
  const task = args[taskIndex];

  const baseFlag = args.find(arg => arg.startsWith('--base='));
  const forceAll = args.includes('--force-all');
  const dryRun = args.includes('--dry-run');
  const configFlag = args.find(arg => arg.startsWith('--config='));

  const base = baseFlag ? baseFlag.split('=')[1] : config.defaultBase;
  const configPath = configFlag ? configFlag.split('=')[1] : null;

  return { task, base, forceAll, dryRun, isRunCommand, configPath };
}

/**
 * Build turbo command with appropriate filters
 */
function buildTurboCommand(task, packages, forceAll, dryRun, config) {
  const baseCommand = dryRun
    ? 'pnpm turbo run --dry-run text'
    : 'pnpm turbo run';
  const taskCommand = `${baseCommand} ${task}`;

  // Force all packages or no specific packages detected
  if (forceAll || packages.includes('all') || packages.length === 0) {
    return { command: taskCommand, scope: 'all-packages' };
  }

  // Check if task should always run on all packages
  if (config.alwaysRunAll.includes(task)) {
    return { command: taskCommand, scope: 'all-packages-safety' };
  }

  // Build selective filter
  const filterArgs = packages.map(pkg => `--filter='${pkg}'`).join(' ');
  const command = `${taskCommand} ${filterArgs}`;

  return { command, scope: 'selective', packages };
}

/**
 * Execute the smart pipeline with enhanced metrics and modular architecture
 */
function main() {
  // Initialize performance tracking
  const performanceMetrics = new PerformanceMetrics();
  performanceMetrics.startPhase('initialization');

  // Load configuration (supports external .turbo-smart.json)
  let config = loadConfig();
  const { task, base, forceAll, dryRun, configPath } = parseArgs(config);

  if (configPath) {
    // Reload with custom config path if specified
    config = loadConfig(configPath);
  }

  performanceMetrics.endPhase();

  if (!task) {
    console.error('❌ Please specify a task to run');
    console.log(
      'Usage: node scripts/smart-turbo.js <task> [--base=<git-ref>] [--force-all] [--dry-run] [--config=<path>]'
    );
    console.log('   or: node scripts/smart-turbo.js run <task> [options]');
    process.exit(1);
  }

  performanceMetrics.startPhase('task-analysis');

  // Check if we should use selective execution
  const shouldUseSelective = !forceAll && config.selectiveTasks.includes(task);

  if (!shouldUseSelective) {
    performanceMetrics.endPhase();
    performanceMetrics.startPhase('turbo-execution');

    // Use standard turbo execution
    const command = dryRun
      ? `pnpm turbo run --dry-run text ${task}`
      : `pnpm turbo run ${task}`;

    try {
      const turboStart = Date.now();
      execSync(command, { stdio: 'inherit' });
      const turboTime = Date.now() - turboStart;

      performanceMetrics.recordTurboTime(turboTime);
      performanceMetrics.endPhase();

      const finalMetrics = performanceMetrics.finalize();
      logExecutionSummary(
        task,
        { scope: 'all-packages' },
        finalMetrics,
        config
      );
    } catch (error) {
      process.exit(error.status || 1);
    }
    return;
  }

  performanceMetrics.endPhase();
  performanceMetrics.startPhase('git-validation');

  // Validate git base exists
  if (!checkGitBase(base)) {
    console.warn(
      `⚠️  Git reference '${base}' not found, using standard execution`
    );

    performanceMetrics.endPhase();
    performanceMetrics.startPhase('turbo-execution');

    const command = dryRun
      ? `pnpm turbo run --dry-run text ${task}`
      : `pnpm turbo run ${task}`;

    try {
      const turboStart = Date.now();
      execSync(command, { stdio: 'inherit' });
      const turboTime = Date.now() - turboStart;

      performanceMetrics.recordTurboTime(turboTime);
      performanceMetrics.endPhase();

      const finalMetrics = performanceMetrics.finalize();
      logExecutionSummary(
        task,
        { scope: 'all-packages' },
        finalMetrics,
        config
      );
    } catch (error) {
      process.exit(error.status || 1);
    }
    return;
  }

  performanceMetrics.endPhase();
  performanceMetrics.startPhase('package-analysis');

  // Get changed packages with timing
  const changeResult = getChangedPackages(base);

  if (changeResult.gitDiffTime) {
    performanceMetrics.recordGitTime(changeResult.gitDiffTime);
  }

  // Record package metrics
  const totalPackages = 2; // This could be determined dynamically in the future
  const selectedPackages = changeResult.packages.includes('all')
    ? totalPackages
    : changeResult.packages.length;

  performanceMetrics.recordPackageMetrics({
    totalPackages,
    selectedPackages,
  });

  const result = buildTurboCommand(
    task,
    changeResult.packages,
    forceAll,
    dryRun,
    config
  );

  performanceMetrics.endPhase();
  performanceMetrics.startPhase('turbo-execution');

  try {
    const turboStart = Date.now();
    execSync(result.command, { stdio: 'inherit' });
    const turboTime = Date.now() - turboStart;

    performanceMetrics.recordTurboTime(turboTime);
    performanceMetrics.endPhase();

    const finalMetrics = performanceMetrics.finalize();
    logExecutionSummary(task, result, finalMetrics, config);
  } catch (error) {
    console.error(`❌ Smart turbo execution failed for task: ${task}`);
    process.exit(error.status || 1);
  }
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  const config = loadConfig();
  console.log(`
🧠 Smart Turbo - Dynamic Task Execution (Enhanced)

USAGE:
  node scripts/smart-turbo.js <task> [options]
  node scripts/smart-turbo.js run <task> [options]

TASKS:
  lint, type-check, test, graph:validate, build, test:mutation

OPTIONS:
  --base=<ref>     Git reference to compare against (default: ${config.defaultBase})
  --force-all      Force execution on all packages
  --dry-run        Show what would be executed without running
  --config=<path>  Use custom configuration file
  --help           Show this help

CONFIGURATION:
  Smart Turbo supports external configuration via .turbo-smart.json
  Place in project root, home directory, or specify with --config

EXAMPLES:
  node scripts/smart-turbo.js lint
    → Run linting only on packages with changes since ${config.defaultBase}

  node scripts/smart-turbo.js test --base=HEAD^1
    → Run tests only on packages changed since last commit

  node scripts/smart-turbo.js build --force-all
    → Force build on all packages regardless of changes

  node scripts/smart-turbo.js lint --config=./custom-config.json
    → Use custom configuration file

FEATURES:
  ✨ Modular architecture with git, config, and performance modules
  ⚡ Enhanced performance metrics with detailed timing breakdown
  🔧 External configuration file support (.turbo-smart.json)
  🛡️ Security-first design with comprehensive input validation
  📊 Detailed execution analysis and efficiency reporting

SELECTIVE TASKS: ${config.selectiveTasks.join(', ')}
ALWAYS-ALL TASKS: ${config.alwaysRunAll.join(', ')}
`);
  process.exit(0);
}

// Run main function
main();
