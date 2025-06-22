#!/usr/bin/env node

/**
 * Smart Turbo Pipeline - Dynamic Task Execution
 *
 * Intelligently determines which packages need to run based on changed files,
 * providing faster feedback loops while maintaining dependency integrity.
 *
 * This script integrates seamlessly with existing turbo workflows while adding
 * selective execution capabilities for improved developer productivity.
 */

import { execSync } from 'child_process';

/**
 * Configuration for smart pipeline execution
 */
const CONFIG = {
  // Default git reference to compare against
  defaultBase: 'main',

  // Tasks that should always run on all packages for safety
  alwaysRunAll: ['test:mutation', 'build'],

  // Tasks that can safely run selectively
  selectiveTasks: ['lint', 'type-check', 'test', 'graph:validate'],

  // Enable performance logging
  logPerformance: true,
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  // Handle turbo run command format: smart-turbo.js run <task> [options]
  const isRunCommand = args[0] === 'run';
  const taskIndex = isRunCommand ? 1 : 0;
  const task = args[taskIndex];

  const baseFlag = args.find(arg => arg.startsWith('--base='));
  const forceAll = args.includes('--force-all');
  const dryRun = args.includes('--dry-run');

  const base = baseFlag ? baseFlag.split('=')[1] : CONFIG.defaultBase;

  return { task, base, forceAll, dryRun, isRunCommand };
}

/**
 * Check if git base reference exists
 */
function checkGitBase(base) {
  try {
    execSync(`git rev-parse --verify ${base}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get changed packages since base reference
 */
function getChangedPackages(base) {
  try {
    // Get list of changed files
    const changedFiles = execSync(`git diff --name-only ${base}...HEAD`, {
      encoding: 'utf-8',
      stdio: 'pipe',
    })
      .trim()
      .split('\n')
      .filter(Boolean);

    if (changedFiles.length === 0) {
      return { packages: [], reason: 'no-changes' };
    }

    // Determine which packages are affected
    const affectedPackages = new Set();

    for (const file of changedFiles) {
      if (file.startsWith('apps/')) {
        const appName = file.split('/')[1];
        if (appName) affectedPackages.add(`./apps/${appName}`);
      } else if (file.startsWith('packages/')) {
        const packageName = file.split('/')[1];
        if (packageName) affectedPackages.add(`./packages/${packageName}`);
      } else {
        // Root level changes affect all packages
        return { packages: ['all'], reason: 'root-changes', files: [file] };
      }
    }

    return {
      packages: Array.from(affectedPackages),
      reason: 'package-changes',
      files: changedFiles,
    };
  } catch (error) {
    return { packages: ['all'], reason: 'error', error: error.message };
  }
}

/**
 * Build turbo command with appropriate filters
 */
function buildTurboCommand(task, packages, forceAll, dryRun) {
  const baseCommand = dryRun
    ? 'pnpm turbo run --dry-run text'
    : 'pnpm turbo run';
  const taskCommand = `${baseCommand} ${task}`;

  // Force all packages or no specific packages detected
  if (forceAll || packages.includes('all') || packages.length === 0) {
    return { command: taskCommand, scope: 'all-packages' };
  }

  // Check if task should always run on all packages
  if (CONFIG.alwaysRunAll.includes(task)) {
    return { command: taskCommand, scope: 'all-packages-safety' };
  }

  // Build selective filter
  const filterArgs = packages.map(pkg => `--filter='${pkg}'`).join(' ');
  const command = `${taskCommand} ${filterArgs}`;

  return { command, scope: 'selective', packages };
}

/**
 * Log execution information
 */
function logExecution(task, result, startTime) {
  const duration = Date.now() - startTime;

  console.log('');
  console.log('📊 Smart Turbo Execution Summary');
  console.log(`   Task: ${task}`);
  console.log(`   Scope: ${result.scope}`);

  if (result.packages) {
    console.log(`   Packages: ${result.packages.join(', ')}`);
  }

  if (CONFIG.logPerformance) {
    console.log(`   Duration: ${duration}ms`);
  }

  console.log('');
}

/**
 * Execute the smart pipeline
 */
function main() {
  const startTime = Date.now();
  const { task, base, forceAll, dryRun } = parseArgs();

  if (!task) {
    console.error('❌ Please specify a task to run');
    console.log(
      'Usage: node scripts/smart-turbo.js <task> [--base=<git-ref>] [--force-all] [--dry-run]'
    );
    console.log('   or: node scripts/smart-turbo.js run <task> [options]');
    process.exit(1);
  }

  // Check if we should use selective execution
  const shouldUseSelective = !forceAll && CONFIG.selectiveTasks.includes(task);

  if (!shouldUseSelective) {
    // Use standard turbo execution
    const command = dryRun
      ? `pnpm turbo run --dry-run text ${task}`
      : `pnpm turbo run ${task}`;

    try {
      execSync(command, { stdio: 'inherit' });
      logExecution(task, { scope: 'all-packages' }, startTime);
    } catch (error) {
      process.exit(error.status || 1);
    }
    return;
  }

  // Validate git base exists
  if (!checkGitBase(base)) {
    console.warn(
      `⚠️  Git reference '${base}' not found, using standard execution`
    );
    const command = dryRun
      ? `pnpm turbo run --dry-run text ${task}`
      : `pnpm turbo run ${task}`;

    try {
      execSync(command, { stdio: 'inherit' });
      logExecution(task, { scope: 'all-packages' }, startTime);
    } catch (error) {
      process.exit(error.status || 1);
    }
    return;
  }

  // Get changed packages
  const changeResult = getChangedPackages(base);
  const result = buildTurboCommand(
    task,
    changeResult.packages,
    forceAll,
    dryRun
  );

  try {
    execSync(result.command, { stdio: 'inherit' });
    logExecution(task, result, startTime);
  } catch (error) {
    console.error(`❌ Smart turbo execution failed for task: ${task}`);
    process.exit(error.status || 1);
  }
}

// Handle help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🧠 Smart Turbo - Dynamic Task Execution

USAGE:
  node scripts/smart-turbo.js <task> [options]
  node scripts/smart-turbo.js run <task> [options]

TASKS:
  lint, type-check, test, graph:validate, build, test:mutation

OPTIONS:
  --base=<ref>     Git reference to compare against (default: main)
  --force-all      Force execution on all packages
  --dry-run        Show what would be executed without running
  --help           Show this help

EXAMPLES:
  node scripts/smart-turbo.js lint
    → Run linting only on packages with changes since main

  node scripts/smart-turbo.js test --base=HEAD^1
    → Run tests only on packages changed since last commit

  node scripts/smart-turbo.js build --force-all
    → Force build on all packages regardless of changes

SELECTIVE TASKS: ${CONFIG.selectiveTasks.join(', ')}
ALWAYS-ALL TASKS: ${CONFIG.alwaysRunAll.join(', ')}
`);
  process.exit(0);
}

// Run main function
main();
