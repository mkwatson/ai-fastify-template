#!/usr/bin/env node

/**
 * Cross-platform file size checker for pre-commit hooks
 * Replaces platform-specific stat commands with Node.js fs.statSync
 */

/* eslint-env node */
/* eslint-disable no-undef */

import { statSync } from 'fs';
import { execSync } from 'child_process';

const MAX_FILE_SIZE = 1048576; // 1MB in bytes

try {
  // Get list of staged files
  const stagedFiles = execSync('git diff --cached --name-only', {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(Boolean);

  let hasLargeFiles = false;
  const largeFiles = [];

  for (const file of stagedFiles) {
    try {
      const stats = statSync(file);
      if (stats.size > MAX_FILE_SIZE) {
        hasLargeFiles = true;
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        largeFiles.push(`${file} (${sizeMB}MB)`);
      }
    } catch (error) {
      // File doesn't exist (possibly deleted), skip it
      if (error.code !== 'ENOENT') {
        console.error(`Error checking ${file}: ${error.message}`);
      }
    }
  }

  if (hasLargeFiles) {
    console.error('❌ Large files detected (>1MB):');
    largeFiles.forEach(file => console.error(`   - ${file}`));
    console.error('\nTo fix: Consider using Git LFS for large files:');
    console.error('   1. Install Git LFS: brew install git-lfs');
    console.error('   2. Track large files: git lfs track "*.extension"');
    console.error('   3. Add .gitattributes: git add .gitattributes');
    process.exit(1);
  }

  // Success - no output needed
  process.exit(0);
} catch (error) {
  console.error(`❌ File size check failed: ${error.message}`);
  process.exit(1);
}
