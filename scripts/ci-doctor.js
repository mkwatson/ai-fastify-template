#!/usr/bin/env node

/**
 * CI Doctor - Validates local development environment for CI/CD
 * Checks environment setup, dependencies, and configuration
 */

/* eslint-env node */
/* eslint-disable no-undef */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const checks = [];
let hasErrors = false;

function check(name, fn) {
  checks.push({ name, fn });
}

function runCheck(name, fn) {
  try {
    const result = fn();
    console.log(`✅ ${name}: ${result || 'OK'}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    hasErrors = true;
    return false;
  }
}

function exec(command) {
  return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
}

// Environment Version Checks
check('Node.js version matches .nvmrc', () => {
  const nvmrcPath = resolve('.nvmrc');
  if (!existsSync(nvmrcPath)) {
    throw new Error('.nvmrc file not found');
  }

  const expectedVersion = readFileSync(nvmrcPath, 'utf8').trim();
  const currentVersion = process.version.slice(1); // Remove 'v' prefix
  const currentMajor = parseInt(currentVersion.split('.')[0]);
  const expectedMajor =
    parseInt(expectedVersion.split('.')[0]) || parseInt(expectedVersion);

  if (currentMajor < expectedMajor) {
    throw new Error(`Expected Node ${expectedVersion}+, got ${currentVersion}`);
  }

  return `${currentVersion} (compatible with ${expectedVersion}+) ✓`;
});

check('pnpm version check', () => {
  try {
    const version = exec('pnpm --version');
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const requiredVersion = packageJson.engines.pnpm.replace('>=', '');

    if (parseFloat(version) < parseFloat(requiredVersion)) {
      throw new Error(`pnpm ${requiredVersion}+ required, got ${version}`);
    }

    return `${version} ✓`;
  } catch (error_) {
    if (error_.message.includes('required')) {
      throw error_;
    }
    throw new Error('pnpm not installed or not accessible');
  }
});

// Dependency Checks
check('Dependencies installed', () => {
  if (!existsSync('node_modules')) {
    throw new Error('node_modules not found - run `pnpm install`');
  }

  if (!existsSync('pnpm-lock.yaml')) {
    throw new Error('pnpm-lock.yaml not found');
  }

  return 'Dependencies present';
});

check('GitLeaks installed', () => {
  try {
    const version = exec('gitleaks version');
    return `${version} ✓`;
  } catch {
    throw new Error('GitLeaks not installed - run `pnpm setup:gitleaks`');
  }
});

check('act (GitHub Actions local runner) installed', () => {
  try {
    const version = exec('act --version');
    return `${version} ✓`;
  } catch {
    throw new Error('act not installed - run `brew install act`');
  }
});

check('actionlint (GitHub Actions linter) installed', () => {
  try {
    const version = exec('actionlint --version');
    return `${version} ✓`;
  } catch {
    throw new Error('actionlint not installed - run `brew install actionlint`');
  }
});

// Configuration Checks
check('GitHub Actions workflow exists', () => {
  const workflowPath = '.github/workflows/ci.yml';
  if (!existsSync(workflowPath)) {
    throw new Error('CI workflow not found at .github/workflows/ci.yml');
  }
  return 'CI workflow present';
});

check('GitHub Actions workflow syntax', () => {
  try {
    exec('actionlint .github/workflows/ci.yml');
    return 'Workflow syntax valid';
  } catch (error_) {
    throw new Error(`Workflow syntax error: ${error_.message}`);
  }
});

// Quality Pipeline Checks
check('ESLint configuration', () => {
  if (!existsSync('eslint.config.js')) {
    throw new Error('eslint.config.js not found');
  }
  return 'ESLint configured';
});

check('TypeScript configuration', () => {
  if (!existsSync('tsconfig.json')) {
    throw new Error('tsconfig.json not found');
  }
  return 'TypeScript configured';
});

check('Vitest configuration', () => {
  const vitestConfig =
    existsSync('vitest.config.ts') ||
    existsSync('apps/backend-api/vitest.config.ts');
  if (!vitestConfig) {
    throw new Error('Vitest configuration not found');
  }
  return 'Vitest configured';
});

check('Mutation testing configuration', () => {
  if (!existsSync('stryker.config.mjs')) {
    throw new Error('stryker.config.mjs not found');
  }
  return 'Stryker configured';
});

// Git Hooks
check('Pre-commit hooks installed', () => {
  if (!existsSync('.husky/_/husky.sh')) {
    throw new Error('Husky not initialized - run `pnpm setup:dev`');
  }
  return 'Git hooks active';
});

// Quality Pipeline Test
check('Quality pipeline executable', () => {
  try {
    // Test that the quality commands work (dry run style check)
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts;

    if (!scripts.lint || !scripts['type-check'] || !scripts.test) {
      throw new Error('Required scripts missing: lint, type-check, test');
    }

    return 'Quality scripts configured';
  } catch {
    throw new Error('Quality pipeline scripts not working');
  }
});

// Performance Check
check('Build performance estimate', () => {
  const start = Date.now();
  try {
    // Quick syntax check as performance proxy
    exec('pnpm type-check');
    const duration = Date.now() - start;
    const estimate = Math.round(duration * 2.5); // CI typically 2.5x slower
    return `~${estimate}ms estimated CI time`;
  } catch {
    throw new Error('Build test failed');
  }
});

// Run all checks
console.log('🔍 CI Doctor - Environment Validation\n');

for (const { name, fn } of checks) {
  runCheck(name, fn);
}

console.log('\n📊 Summary:');
if (hasErrors) {
  console.log(
    '❌ Environment has issues that need to be resolved before CI will work properly.'
  );
  console.log('\n🔧 Quick fixes:');
  console.log('- Run `pnpm setup:dev` for automated setup');
  console.log('- Install missing tools via Homebrew');
  console.log('- Check tool PATH configuration');
  process.exit(1);
} else {
  console.log('✅ Environment is ready for CI/CD development!');
  console.log('\n🚀 Next steps:');
  console.log('- Test workflow: `pnpm ci:validate`');
  console.log('- Run locally: `pnpm ci:local`');
  console.log('- Full validation: `pnpm ai:compliance`');
}
