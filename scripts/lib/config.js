#!/usr/bin/env node

/**
 * Configuration Module - Smart Turbo Configuration Management
 *
 * Supports external configuration files with validation and fallback to defaults.
 * Provides type-safe configuration loading with comprehensive error handling.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Default configuration for smart pipeline execution
 */
const DEFAULT_CONFIG = {
  // Default git reference to compare against
  defaultBase: 'main',

  // Tasks that should always run on all packages for safety
  alwaysRunAll: ['test:mutation', 'build'],

  // Tasks that can safely run selectively
  selectiveTasks: ['lint', 'type-check', 'test', 'graph:validate'],

  // Enable performance logging
  logPerformance: true,

  // Performance logging options
  performanceLogging: {
    enabled: true,
    includeGitTiming: true,
    includeTurboTiming: true,
    includePackageMetrics: true,
  },

  // Git operation settings
  git: {
    maxDiffFiles: 1000, // Fail-safe for very large changesets
    timeoutMs: 10000, // Git command timeout
  },
};

/**
 * Validate configuration object structure
 * @param {Object} config - Configuration object to validate
 * @returns {Object} - Validation result with errors if any
 */
function validateConfig(config) {
  const errors = [];

  // Required fields
  if (!config.defaultBase || typeof config.defaultBase !== 'string') {
    errors.push('defaultBase must be a non-empty string');
  }

  if (!Array.isArray(config.alwaysRunAll)) {
    errors.push('alwaysRunAll must be an array');
  }

  if (!Array.isArray(config.selectiveTasks)) {
    errors.push('selectiveTasks must be an array');
  }

  if (typeof config.logPerformance !== 'boolean') {
    errors.push('logPerformance must be a boolean');
  }

  // Validate task arrays contain only strings
  if (
    config.alwaysRunAll &&
    Array.isArray(config.alwaysRunAll) &&
    !config.alwaysRunAll.every(task => typeof task === 'string')
  ) {
    errors.push('alwaysRunAll must contain only strings');
  }

  if (
    config.selectiveTasks &&
    Array.isArray(config.selectiveTasks) &&
    !config.selectiveTasks.every(task => typeof task === 'string')
  ) {
    errors.push('selectiveTasks must contain only strings');
  }

  // Validate git configuration if present
  if (config.git) {
    if (
      config.git.maxDiffFiles &&
      (!Number.isInteger(config.git.maxDiffFiles) ||
        config.git.maxDiffFiles <= 0)
    ) {
      errors.push('git.maxDiffFiles must be a positive integer');
    }

    if (
      config.git.timeoutMs &&
      (!Number.isInteger(config.git.timeoutMs) || config.git.timeoutMs <= 0)
    ) {
      errors.push('git.timeoutMs must be a positive integer');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Load configuration from external file if it exists
 * @param {string} configPath - Path to configuration file
 * @returns {Object|null} - Parsed configuration or null if not found/invalid
 */
function loadExternalConfig(configPath) {
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const configContent = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    const validation = validateConfig(config);
    if (!validation.valid) {
      console.error(`❌ Invalid configuration in ${configPath}:`);
      validation.errors.forEach(error => console.error(`   • ${error}`));
      console.error('   Using default configuration instead.');
      return null;
    }

    return config;
  } catch (error) {
    console.error(
      `❌ Failed to load configuration from ${configPath}: ${error.message}`
    );
    console.error('   Using default configuration instead.');
    return null;
  }
}

/**
 * Load configuration with fallback chain
 * @param {string} [customPath] - Optional custom configuration path
 * @returns {Object} - Final configuration object
 */
export function loadConfig(customPath = null) {
  const configPaths = [
    customPath,
    '.turbo-smart.json',
    join(process.cwd(), '.turbo-smart.json'),
    join(process.env.HOME || '~', '.turbo-smart.json'),
  ].filter(Boolean);

  for (const configPath of configPaths) {
    const externalConfig = loadExternalConfig(configPath);
    if (externalConfig) {
      // Merge with defaults to ensure all required fields are present
      const mergedConfig = {
        ...DEFAULT_CONFIG,
        ...externalConfig,
        // Deep merge nested objects
        performanceLogging: {
          ...DEFAULT_CONFIG.performanceLogging,
          ...(externalConfig.performanceLogging || {}),
        },
        git: {
          ...DEFAULT_CONFIG.git,
          ...(externalConfig.git || {}),
        },
      };

      console.log(`🔧 Loaded configuration from ${configPath}`);
      return mergedConfig;
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * Generate example configuration file content
 * @returns {string} - JSON string with example configuration
 */
export function generateExampleConfig() {
  const exampleConfig = {
    ...DEFAULT_CONFIG,
    // Add comments as property descriptions
    _comments: {
      defaultBase: 'Git reference to compare against for change detection',
      alwaysRunAll:
        'Tasks that must run on all packages for safety/correctness',
      selectiveTasks: 'Tasks that can safely run only on changed packages',
      logPerformance: 'Enable detailed performance and timing information',
      performanceLogging: 'Fine-grained control over performance metrics',
      git: 'Git operation settings and limits',
    },
  };

  return JSON.stringify(exampleConfig, null, 2);
}

/**
 * Get the current effective configuration
 * @returns {Object} - Current configuration with metadata
 */
export function getConfigInfo() {
  const config = loadConfig();
  const configPaths = [
    '.turbo-smart.json',
    join(process.cwd(), '.turbo-smart.json'),
    join(process.env.HOME || '~', '.turbo-smart.json'),
  ];

  const loadedFrom = configPaths.find(path => existsSync(path)) || 'defaults';

  return {
    config,
    loadedFrom,
    isDefault: loadedFrom === 'defaults',
  };
}
