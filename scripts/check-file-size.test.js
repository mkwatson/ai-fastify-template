#!/usr/bin/env node

/**
 * Tests for check-file-size.js script
 * Run with: node scripts/check-file-size.test.js
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

// Create test repository
const testRepoDir = join(__dirname, '.test-repo');

function setupTestRepo() {
  if (existsSync(testRepoDir)) {
    rmSync(testRepoDir, { recursive: true });
  }
  mkdirSync(testRepoDir);

  // Initialize git repo
  execSync('git init', { cwd: testRepoDir });
  execSync('git config user.email "test@example.com"', { cwd: testRepoDir });
  execSync('git config user.name "Test User"', { cwd: testRepoDir });
}

function cleanupTestRepo() {
  if (existsSync(testRepoDir)) {
    rmSync(testRepoDir, { recursive: true });
  }
}

// Tests
test('Script handles no staged files gracefully', () => {
  setupTestRepo();

  try {
    const result = execSync(`node ${join(__dirname, 'check-file-size.js')}`, {
      cwd: testRepoDir,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    // Should succeed silently with no staged files
    assert(result === '', 'Should have no output when no files are staged');
  } finally {
    cleanupTestRepo();
  }
});

test('Script detects large files correctly', () => {
  setupTestRepo();

  try {
    // Create a large file (>1MB)
    const largeContent = 'x'.repeat(1048577); // 1MB + 1 byte
    writeFileSync(join(testRepoDir, 'large.txt'), largeContent);

    // Stage the file
    execSync('git add large.txt', { cwd: testRepoDir });

    // Run the check - should fail
    let failed = false;
    try {
      execSync(`node ${join(__dirname, 'check-file-size.js')}`, {
        cwd: testRepoDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (error) {
      failed = true;
      const output = error.stdout || error.stderr || '';
      assert(
        output.includes('Large files detected'),
        'Should report large files'
      );
      assert(output.includes('large.txt'), 'Should mention the specific file');
      assert(
        output.includes('Consider using Git LFS'),
        'Should suggest Git LFS'
      );
    }

    assert(failed, 'Script should fail when large files are detected');
  } finally {
    cleanupTestRepo();
  }
});

test('Script allows files under 1MB', () => {
  setupTestRepo();

  try {
    // Create a file just under 1MB
    const smallContent = 'x'.repeat(1048575); // 1MB - 1 byte
    writeFileSync(join(testRepoDir, 'small.txt'), smallContent);

    // Stage the file
    execSync('git add small.txt', { cwd: testRepoDir });

    // Run the check - should pass
    const result = execSync(`node ${join(__dirname, 'check-file-size.js')}`, {
      cwd: testRepoDir,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    assert(result === '', 'Should have no output when files are under limit');
  } finally {
    cleanupTestRepo();
  }
});

test('Script handles deleted files gracefully', () => {
  setupTestRepo();

  try {
    // Create and commit a file
    writeFileSync(join(testRepoDir, 'file.txt'), 'content');
    execSync('git add file.txt', { cwd: testRepoDir });
    execSync('git commit -m "Add file"', { cwd: testRepoDir });

    // Delete the file and stage the deletion
    rmSync(join(testRepoDir, 'file.txt'));
    execSync('git add file.txt', { cwd: testRepoDir });

    // Run the check - should pass
    const result = execSync(`node ${join(__dirname, 'check-file-size.js')}`, {
      cwd: testRepoDir,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    assert(result === '', 'Should handle deleted files without error');
  } finally {
    cleanupTestRepo();
  }
});

test('Script provides helpful error messages', () => {
  setupTestRepo();

  try {
    // Create multiple large files
    writeFileSync(join(testRepoDir, 'large1.bin'), 'x'.repeat(2 * 1024 * 1024)); // 2MB
    writeFileSync(join(testRepoDir, 'large2.bin'), 'x'.repeat(3 * 1024 * 1024)); // 3MB

    execSync('git add *.bin', { cwd: testRepoDir });

    let output = '';
    try {
      execSync(`node ${join(__dirname, 'check-file-size.js')}`, {
        cwd: testRepoDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });
    } catch (error) {
      output = error.stdout || error.stderr || '';
    }

    assert(
      output.includes('large1.bin (2.00MB)'),
      'Should show file size in MB'
    );
    assert(
      output.includes('large2.bin (3.00MB)'),
      'Should show file size in MB'
    );
    assert(
      output.includes('Install Git LFS'),
      'Should provide installation instructions'
    );
  } finally {
    cleanupTestRepo();
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
