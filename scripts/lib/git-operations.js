#!/usr/bin/env node

/**
 * Git Operations Module - Secure Git Command Abstraction
 *
 * Provides safe, tested git operations with comprehensive security validation.
 * All git references are sanitized to prevent command injection attacks.
 */

import { execSync } from 'child_process';

/**
 * Validate and sanitize git reference
 * Only allows alphanumeric, dash, underscore, slash, caret, tilde, and dot
 * @param {string} ref - Git reference to validate
 * @returns {string} - Sanitized git reference
 * @throws {Error} - If reference contains invalid characters
 */
export function sanitizeGitRef(ref) {
  if (!/^[a-zA-Z0-9\-_/^~.]+$/.test(ref)) {
    throw new Error(
      `Invalid git reference: ${ref}. Only alphanumeric characters, dash, underscore, slash, caret, tilde, and dot are allowed.`
    );
  }
  return ref;
}

/**
 * Check if git base reference exists
 * @param {string} base - Git reference to check
 * @returns {boolean} - True if reference exists
 */
export function checkGitBase(base) {
  try {
    const sanitizedBase = sanitizeGitRef(base);
    execSync(`git rev-parse --verify ${sanitizedBase}`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    if (error.message && error.message.includes('Invalid git reference')) {
      console.error(error.message);
    }
    return false;
  }
}

/**
 * Get changed files since base reference
 * @param {string} base - Git reference to compare against
 * @returns {Object} - Result with changed files and metadata
 */
export function getChangedFiles(base) {
  const startTime = Date.now();

  try {
    const sanitizedBase = sanitizeGitRef(base);

    // Get list of changed files
    const changedFiles = execSync(
      `git diff --name-only ${sanitizedBase}...HEAD`,
      {
        encoding: 'utf-8',
        stdio: 'pipe',
      }
    )
      .trim()
      .split('\n')
      .filter(Boolean);

    const gitDiffTime = Date.now() - startTime;

    return {
      files: changedFiles,
      gitDiffTime,
      success: true,
    };
  } catch (error) {
    const gitDiffTime = Date.now() - startTime;
    return {
      files: [],
      gitDiffTime,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Analyze changed files and determine affected packages
 * @param {string[]} changedFiles - List of changed file paths
 * @returns {Object} - Analysis result with affected packages
 */
export function analyzeChangedPackages(changedFiles) {
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
      return {
        packages: ['all'],
        reason: 'root-changes',
        files: [file],
        totalFiles: changedFiles.length,
      };
    }
  }

  return {
    packages: Array.from(affectedPackages),
    reason: 'package-changes',
    files: changedFiles,
    totalFiles: changedFiles.length,
  };
}

/**
 * Get changed packages since base reference with comprehensive analysis
 * @param {string} base - Git reference to compare against
 * @returns {Object} - Complete analysis with packages, timing, and metadata
 */
export function getChangedPackages(base) {
  const result = getChangedFiles(base);

  if (!result.success) {
    return {
      packages: ['all'],
      reason: 'git-error',
      error: result.error,
      gitDiffTime: result.gitDiffTime,
    };
  }

  const analysis = analyzeChangedPackages(result.files);

  return {
    ...analysis,
    gitDiffTime: result.gitDiffTime,
  };
}

/**
 * Get repository information for diagnostics
 * @returns {Object} - Repository status information
 */
export function getRepoInfo() {
  try {
    const currentBranch = execSync('git branch --show-current', {
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();

    const lastCommit = execSync('git log -1 --format="%h %s"', {
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();

    return {
      branch: currentBranch,
      lastCommit,
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
