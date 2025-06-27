#!/usr/bin/env node
/**
 * Enhanced Vitest configuration validation
 * 
 * Compares actual configuration objects to ensure critical properties stay synchronized
 * between workspace and mutation testing configurations.
 */

import { pathToFileURL } from 'url';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Color output for terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function loadConfig(configPath) {
  try {
    const fullPath = path.resolve(configPath);
    const configUrl = pathToFileURL(fullPath).href;
    const module = await import(configUrl);
    return module.default;
  } catch (error) {
    throw new Error(`Failed to load config ${configPath}: ${error.message}`);
  }
}

function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

async function validateConfigs() {
  console.log(colorize('blue', '🔍 Validating Vitest configuration consistency...\n'));
  
  const configPaths = {
    workspace: './vitest.config.ts',
    mutation: './vitest.mutation.config.ts',
    base: './vitest.base.config.ts'
  };
  
  let workspaceConfig, mutationConfig, baseConfig;
  
  try {
    [workspaceConfig, mutationConfig, baseConfig] = await Promise.all([
      loadConfig(configPaths.workspace),
      loadConfig(configPaths.mutation),
      loadConfig(configPaths.base)
    ]);
  } catch (error) {
    console.error(colorize('red', `❌ Config loading failed: ${error.message}`));
    process.exit(1);
  }
  
  // Import critical sync properties from base config
  const { CRITICAL_SYNC_PROPERTIES } = await import(path.resolve('./vitest.base.config.ts'));
  
  const errors = [];
  const warnings = [];
  
  console.log(colorize('yellow', 'Checking critical properties that MUST be synchronized:\n'));
  
  for (const propertyPath of CRITICAL_SYNC_PROPERTIES) {
    const workspaceValue = getNestedProperty(workspaceConfig, propertyPath);
    const mutationValue = getNestedProperty(mutationConfig, propertyPath);
    const baseValue = getNestedProperty(baseConfig, propertyPath);
    
    console.log(`  ${colorize('blue', propertyPath)}:`);
    
    // Check if both configs match the base config
    const workspaceMatches = deepEqual(workspaceValue, baseValue);
    const mutationMatches = deepEqual(mutationValue, baseValue);
    
    if (!workspaceMatches || !mutationMatches) {
      errors.push({
        property: propertyPath,
        workspace: workspaceValue,
        mutation: mutationValue,
        base: baseValue,
        workspaceMatches,
        mutationMatches
      });
      
      console.log(`    ${colorize('red', '❌ MISMATCH DETECTED')}`);
      if (!workspaceMatches) {
        console.log(`    ${colorize('red', '  • Workspace config differs from base')}`);
      }
      if (!mutationMatches) {
        console.log(`    ${colorize('red', '  • Mutation config differs from base')}`);
      }
    } else {
      console.log(`    ${colorize('green', '✅ Synchronized')}`);
    }
  }
  
  console.log('\n' + colorize('yellow', 'Checking configuration differences:\n'));
  
  // Check for unexpected differences in other properties
  const allProperties = new Set([
    ...Object.keys(workspaceConfig.test || {}),
    ...Object.keys(mutationConfig.test || {}),
    ...Object.keys(workspaceConfig.resolve || {}),
    ...Object.keys(mutationConfig.resolve || {})
  ]);
  
  for (const prop of allProperties) {
    const fullPath = prop.includes('.') ? prop : `test.${prop}`;
    
    if (CRITICAL_SYNC_PROPERTIES.includes(fullPath)) continue; // Already checked
    
    const workspaceValue = getNestedProperty(workspaceConfig, fullPath);
    const mutationValue = getNestedProperty(mutationConfig, fullPath);
    
    if (!deepEqual(workspaceValue, mutationValue)) {
      warnings.push({
        property: fullPath,
        workspace: workspaceValue,
        mutation: mutationValue
      });
    }
  }
  
  if (warnings.length > 0) {
    console.log(colorize('yellow', 'Non-critical differences (may be intentional):\n'));
    warnings.forEach(warning => {
      console.log(`  ${colorize('yellow', warning.property)}:`);
      console.log(`    Workspace: ${JSON.stringify(warning.workspace)}`);
      console.log(`    Mutation:  ${JSON.stringify(warning.mutation)}`);
    });
  }
  
  // Summary
  console.log('\n' + colorize('bold', '📊 VALIDATION SUMMARY:'));
  console.log(`  Critical properties checked: ${CRITICAL_SYNC_PROPERTIES.length}`);
  console.log(`  ${colorize('red', 'Synchronization errors:')} ${errors.length}`);
  console.log(`  ${colorize('yellow', 'Non-critical differences:')} ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log('\n' + colorize('red', '❌ CONFIGURATION VALIDATION FAILED'));
    console.log(colorize('red', '\nCritical properties are out of sync. This will cause test inconsistencies.'));
    console.log(colorize('yellow', '\nTo fix:'));
    console.log('1. Update vitest.base.config.ts with the correct shared values');
    console.log('2. Ensure both configs import from the base config');
    console.log('3. Run this validation again');
    
    process.exit(1);
  } else {
    console.log('\n' + colorize('green', '✅ CONFIGURATION VALIDATION PASSED'));
    console.log(colorize('green', 'All critical properties are properly synchronized.'));
    
    if (warnings.length > 0) {
      console.log(colorize('yellow', '\nNote: Non-critical differences detected but are likely intentional.'));
    }
  }
}

// Run validation
validateConfigs().catch(error => {
  console.error(colorize('red', `💥 Validation failed: ${error.message}`));
  process.exit(1);
});