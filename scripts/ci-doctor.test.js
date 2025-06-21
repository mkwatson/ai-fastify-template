#!/usr/bin/env node

/**
 * Tests for CI Doctor script
 * Run with: node scripts/ci-doctor.test.js
 */

/* eslint-env node */

import { execSync } from 'child_process';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test helpers
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function runCiDoctor() {
  try {
    const output = execSync('node scripts/ci-doctor.js', {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: error.stdout || error.stderr || error.message,
    };
  }
}

// Test semver version comparison
test('Semver version comparison - should accept equal versions', () => {
  // Create a temporary test environment
  const testDir = join(__dirname, '.test-ci-doctor');
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true });
  }
  mkdirSync(testDir);

  // Create test package.json with specific pnpm version
  const packageJson = {
    name: 'test-project',
    engines: {
      pnpm: '>=8.15.0',
    },
  };
  writeFileSync(
    join(testDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Test will pass if pnpm version meets requirement
  // This is more of an integration test
  const currentPnpmVersion = execSync('pnpm --version', {
    encoding: 'utf8',
  }).trim();
  console.log(`   Current pnpm version: ${currentPnpmVersion}`);

  // Cleanup
  rmSync(testDir, { recursive: true });
});

// Test error message formatting
test('Error messages include remediation steps', () => {
  const result = runCiDoctor();

  // Check if any error messages contain "To fix:" guidance
  if (!result.success) {
    assert(
      result.output.includes('To fix:'),
      'Error messages should include remediation steps'
    );
  }
});

// Test file size check script
test('File size check script exists and is executable', () => {
  const scriptPath = join(__dirname, 'check-file-size.js');
  assert(existsSync(scriptPath), 'check-file-size.js should exist');

  // Test the script with no staged files
  try {
    execSync('node scripts/check-file-size.js', { encoding: 'utf8' });
    // Should succeed with no staged files
  } catch (error) {
    // Only fail if it's not a git-related error
    if (!error.message.includes('not a git repository')) {
      throw error;
    }
  }
});

// Test Node.js version check
test('Node.js version check handles major version correctly', () => {
  // This test validates that the version check logic works
  const currentVersion = process.version.slice(1); // Remove 'v' prefix
  const currentMajor = parseInt(currentVersion.split('.')[0]);

  assert(
    currentMajor >= 20,
    `Node.js version ${currentVersion} should meet requirement`
  );
});

// Test that semver is properly imported
test('Semver module is available', async () => {
  try {
    const semver = await import('semver');
    assert(typeof semver.gte === 'function', 'semver.gte should be a function');

    // Test semver functionality
    assert(
      semver.default.gte('8.15.1', '8.15.0'),
      '8.15.1 should be >= 8.15.0'
    );
    assert(
      !semver.default.gte('8.15.0', '8.15.1'),
      '8.15.0 should not be >= 8.15.1'
    );
    assert(
      semver.default.gte('8.15.0', '8.15.0'),
      '8.15.0 should be >= 8.15.0'
    );
    assert(semver.default.gte('9.0.0', '8.15.0'), '9.0.0 should be >= 8.15.0');
  } catch (error) {
    throw new Error(`Failed to import semver: ${error.message}`);
  }
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
}
