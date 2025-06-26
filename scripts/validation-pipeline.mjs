#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Zero-Drift Validation Pipeline
 * 
 * Single source of truth for all validation steps.
 * Eliminates configuration drift between local and CI.
 * Features config-aware cache invalidation.
 */

// ===== VALIDATION STEPS DEFINITION =====

const VALIDATION_STEPS = {
  lint: {
    name: 'ESLint + Prettier',
    command: 'pnpm lint',
    configFiles: ['eslint.config.js', '.prettierrc', 'package.json'],
    description: 'Code formatting and linting validation',
    critical: true,
    cacheStrategy: 'config-aware'
  },
  
  'type-check': {
    name: 'TypeScript',
    command: 'pnpm type-check',
    configFiles: ['tsconfig*.json', 'apps/*/tsconfig.json', 'packages/*/tsconfig.json'],
    description: 'TypeScript compilation and type checking',
    critical: true,
    cacheStrategy: 'config-aware'
  },
  
  test: {
    name: 'Test Suite',
    command: 'pnpm test',
    configFiles: ['vitest.config.ts', 'apps/*/vitest.config.ts', 'package.json'],
    description: 'Unit and integration tests',
    critical: true,
    cacheStrategy: 'minimal'
  },
  
  build: {
    name: 'Production Build',
    command: 'pnpm build',
    configFiles: ['tsconfig*.json', 'turbo.json', 'package.json'],
    description: 'Production build verification',
    critical: true,
    cacheStrategy: 'config-aware'
  }
};

// ===== VALIDATION PRESETS =====

const VALIDATION_PRESETS = {
  quick: {
    name: 'Quick Development Validation',
    steps: ['lint', 'type-check'],
    parallel: true,
    cache: 'smart',
    description: 'Fast feedback during development (~5 seconds)'
  },
  
  ci: {
    name: 'CI Pipeline Validation',
    steps: ['lint', 'type-check', 'test', 'build'],
    parallel: false,
    cache: 'none',
    description: 'Complete validation for CI/CD (~30 seconds)'
  },
  
  'pre-commit': {
    name: 'Pre-Commit Validation',
    steps: ['lint', 'type-check', 'test'],
    parallel: false,
    cache: 'config-aware',
    description: 'Balanced validation for pre-commit hooks'
  },
  
  compliance: {
    name: 'Full Compliance Validation',
    steps: ['lint', 'type-check', 'test', 'build'],
    parallel: false,
    cache: 'none',
    extraCommands: ['pnpm test:mutation', 'pnpm ai:security'],
    description: 'Enterprise-grade validation with mutation testing'
  }
};

// ===== CACHE MANAGEMENT =====

class CacheManager {
  constructor() {
    this.cacheDir = join(rootDir, '.validation-cache');
  }

  calculateConfigHash(configFiles) {
    const hash = createHash('md5');
    
    for (const pattern of configFiles) {
      const files = this.expandGlob(pattern);
      for (const file of files.sort()) {
        if (existsSync(file)) {
          hash.update(file);
          hash.update(readFileSync(file));
          hash.update(statSync(file).mtime.toISOString());
        }
      }
    }
    
    return hash.digest('hex');
  }

  expandGlob(pattern) {
    if (!pattern.includes('*')) {
      return [join(rootDir, pattern)];
    }
    
    // Simple glob expansion for our specific patterns
    const files = [];
    if (pattern.includes('tsconfig*.json')) {
      const baseDir = join(rootDir, pattern.replace('tsconfig*.json', ''));
      try {
        const entries = execSync(`find "${baseDir}" -name "tsconfig*.json" -type f`, { encoding: 'utf8' })
          .trim().split('\n').filter(Boolean);
        files.push(...entries);
      } catch {
        // Directory might not exist, skip
      }
    } else if (pattern.includes('*/')) {
      try {
        const entries = execSync(`find "${rootDir}" -path "*/${pattern.split('*/')[1]}" -type f`, { encoding: 'utf8' })
          .trim().split('\n').filter(Boolean);
        files.push(...entries);
      } catch {
        // Pattern might not match, skip
      }
    } else {
      files.push(join(rootDir, pattern));
    }
    
    return files;
  }

  shouldInvalidateCache(stepId, cacheStrategy, force = false) {
    if (force || cacheStrategy === 'none' || cacheStrategy === 'minimal') {
      return true;
    }
    
    const step = VALIDATION_STEPS[stepId];
    if (!step || cacheStrategy !== 'config-aware') {
      return true;
    }
    
    const currentHash = this.calculateConfigHash(step.configFiles);
    const cacheFile = join(this.cacheDir, `${stepId}.hash`);
    
    if (!existsSync(cacheFile)) {
      return true;
    }
    
    const cachedHash = readFileSync(cacheFile, 'utf8').trim();
    return currentHash !== cachedHash;
  }

  updateCache(stepId, cacheStrategy) {
    if (cacheStrategy !== 'config-aware') return;
    
    const step = VALIDATION_STEPS[stepId];
    if (!step) return;
    
    try {
      execSync(`mkdir -p "${this.cacheDir}"`, { stdio: 'ignore' });
      const hash = this.calculateConfigHash(step.configFiles);
      const cacheFile = join(this.cacheDir, `${stepId}.hash`);
      execSync(`echo "${hash}" > "${cacheFile}"`, { stdio: 'ignore' });
    } catch {
      // Cache update failed, not critical
    }
  }

  clearCache() {
    try {
      execSync(`rm -rf "${this.cacheDir}"`, { stdio: 'ignore' });
      console.log('🧹 Validation cache cleared');
    } catch {
      // Cache clear failed, not critical
    }
  }
}

// ===== VALIDATION PIPELINE =====

class ValidationPipeline {
  constructor(options = {}) {
    this.options = {
      force: false,
      verbose: false,
      preset: null,
      steps: null,
      cache: 'smart',
      parallel: false,
      ...options
    };
    
    this.cacheManager = new CacheManager();
    this.startTime = Date.now();
  }

  async run() {
    const { preset, steps, force, verbose } = this.options;
    
    console.log('🛡️ Zero-Drift Validation Pipeline');
    console.log('==================================');
    
    if (force) {
      this.cacheManager.clearCache();
    }
    
    let validationSteps;
    let cacheStrategy;
    let runParallel;
    let extraCommands = [];
    
    if (preset && VALIDATION_PRESETS[preset]) {
      const presetConfig = VALIDATION_PRESETS[preset];
      validationSteps = presetConfig.steps;
      cacheStrategy = presetConfig.cache;
      runParallel = presetConfig.parallel;
      extraCommands = presetConfig.extraCommands || [];
      
      console.log(`📋 Using preset: ${presetConfig.name}`);
      console.log(`📝 ${presetConfig.description}`);
    } else if (steps) {
      validationSteps = steps;
      cacheStrategy = this.options.cache;
      runParallel = this.options.parallel;
    } else {
      throw new Error('Must specify either --preset or --steps');
    }
    
    console.log(`🎯 Steps: ${validationSteps.join(' → ')}`);
    console.log(`💾 Cache: ${cacheStrategy}${force ? ' (bypassed)' : ''}`);
    console.log('');
    
    const results = [];
    
    // Run validation steps
    if (runParallel && validationSteps.length > 1) {
      console.log('⚡ Running steps in parallel...');
      const promises = validationSteps.map(stepId => this.runStep(stepId, cacheStrategy));
      const stepResults = await Promise.all(promises);
      results.push(...stepResults);
    } else {
      for (const stepId of validationSteps) {
        const result = await this.runStep(stepId, cacheStrategy);
        results.push(result);
        
        if (!result.success) {
          break; // Stop on first failure
        }
      }
    }
    
    // Run extra commands if all steps passed
    const allStepsPassed = results.every(r => r.success);
    if (allStepsPassed && extraCommands.length > 0) {
      console.log('🔬 Running additional validation...');
      for (const command of extraCommands) {
        const result = await this.runCommand(command, 'Extra Validation');
        results.push(result);
        if (!result.success) break;
      }
    }
    
    // Summary
    this.printSummary(results);
    
    const allPassed = results.every(r => r.success);
    process.exit(allPassed ? 0 : 1);
  }

  async runStep(stepId, cacheStrategy) {
    const step = VALIDATION_STEPS[stepId];
    if (!step) {
      throw new Error(`Unknown validation step: ${stepId}`);
    }
    
    const shouldInvalidate = this.cacheManager.shouldInvalidateCache(
      stepId, 
      cacheStrategy, 
      this.options.force
    );
    
    const cacheStatus = shouldInvalidate ? '(bypassing cache)' : '(using cache)';
    console.log(`🔍 [${stepId}] ${step.name} ${cacheStatus}`);
    
    if (!shouldInvalidate && !this.options.force) {
      console.log(`✅ [${stepId}] Passed (cached result)`);
      return { stepId, success: true, cached: true };
    }
    
    const result = await this.runCommand(step.command, step.name);
    
    if (result.success) {
      this.cacheManager.updateCache(stepId, cacheStrategy);
    }
    
    return { ...result, stepId, cached: false };
  }

  async runCommand(command, name) {
    const startTime = Date.now();
    
    try {
      if (this.options.verbose) {
        console.log(`  Command: ${command}`);
      }
      
      execSync(command, {
        cwd: rootDir,
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        encoding: 'utf8'
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ [${name}] Passed (${duration}ms)`);
      
      return { success: true, duration, command };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ [${name}] Failed (${duration}ms)`);
      
      if (!this.options.verbose && error.stdout) {
        console.log('Output:', error.stdout);
      }
      if (error.stderr) {
        console.log('Error:', error.stderr);
      }
      
      return { success: false, duration, command, error: error.message };
    }
  }

  printSummary(results) {
    const totalDuration = Date.now() - this.startTime;
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const cached = results.filter(r => r.cached).length;
    
    console.log('');
    console.log('📊 Validation Summary');
    console.log('===================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`💾 Cached: ${cached}`);
    console.log(`⏱️  Total: ${Math.round(totalDuration / 1000)}s`);
    
    if (failed === 0) {
      console.log('');
      console.log('🎉 All validation checks passed!');
      console.log('🚀 Code is ready for production deployment');
    } else {
      console.log('');
      console.log('💥 Validation failed. Please fix the issues above.');
      
      const failedSteps = results.filter(r => !r.success);
      if (failedSteps.length > 0) {
        console.log('');
        console.log('🔧 Quick fixes:');
        failedSteps.forEach(result => {
          if (result.stepId === 'lint') {
            console.log('  • Run: pnpm lint:fix');
          } else if (result.stepId === 'type-check') {
            console.log('  • Check TypeScript errors in your IDE');
          } else if (result.stepId === 'test') {
            console.log('  • Run: pnpm test:watch');
          }
        });
      }
    }
  }
}

// ===== CLI INTERFACE =====

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    force: false,
    verbose: false,
    preset: null,
    steps: null,
    cache: 'smart',
    parallel: false,
    help: false,
    'clear-cache': false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--force':
        options.force = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--preset':
        options.preset = args[++i];
        break;
      case '--steps':
        options.steps = args[++i]?.split(',');
        break;
      case '--cache':
        options.cache = args[++i];
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--clear-cache':
        options['clear-cache'] = true;
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }
  
  return options;
}

function printHelp() {
  console.log(`
🛡️ Zero-Drift Validation Pipeline

USAGE:
  node scripts/validation-pipeline.mjs [OPTIONS]

PRESETS:
  --preset quick       Fast development validation (lint + type-check)
  --preset ci          Complete CI validation (lint + type-check + test + build)
  --preset pre-commit  Pre-commit validation (lint + type-check + test)
  --preset compliance  Full compliance (includes mutation testing)

CUSTOM:
  --steps <steps>      Comma-separated list of steps: lint,type-check,test,build
  --cache <strategy>   Cache strategy: none, smart, config-aware
  --parallel          Run steps in parallel (when possible)

OPTIONS:
  --force             Bypass all caches and run fresh
  --verbose, -v       Show detailed command output
  --clear-cache       Clear validation cache and exit
  --help, -h          Show this help

EXAMPLES:
  node scripts/validation-pipeline.mjs --preset quick
  node scripts/validation-pipeline.mjs --preset ci --force
  node scripts/validation-pipeline.mjs --steps lint,test --parallel
  node scripts/validation-pipeline.mjs --clear-cache

CACHE STRATEGIES:
  none           Never use cache (slowest, most accurate)
  smart          Use cache intelligently based on preset
  config-aware   Invalidate cache when config files change (recommended)
`);
}

// ===== MAIN EXECUTION =====

async function main() {
  try {
    const options = parseArgs();
    
    if (options.help) {
      printHelp();
      process.exit(0);
    }
    
    if (options['clear-cache']) {
      const cacheManager = new CacheManager();
      cacheManager.clearCache();
      process.exit(0);
    }
    
    const pipeline = new ValidationPipeline(options);
    await pipeline.run();
  } catch (error) {
    console.error('💥 Pipeline error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export for testing
export { ValidationPipeline, CacheManager, VALIDATION_STEPS, VALIDATION_PRESETS };