#!/usr/bin/env node --import=tsx
/**
 * Simple Vitest configuration validation
 *
 * Ensures critical properties stay synchronized between workspace
 * and mutation testing configurations.
 */

import { pathToFileURL } from 'url';
import path from 'path';

// Simple color output
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const blue = (text) => `\x1b[34m${text}\x1b[0m`;

async function loadConfig(configPath) {
  const fullPath = path.resolve(configPath);
  const configUrl = pathToFileURL(fullPath).href;
  const module = await import(configUrl);
  
  let config = module.default;
  if (typeof config === 'function') {
    config = await config({ command: 'build', mode: 'test' });
  }
  
  return config;
}

function getValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function validateConfigs() {
  console.log(blue('🔍 Validating Vitest configuration consistency...\n'));

  try {
    // Load configurations
    const [workspace, mutation, base] = await Promise.all([
      loadConfig('./vitest.config.ts'),
      loadConfig('./vitest.mutation.config.ts'),
      loadConfig('./vitest.base.config.ts'),
    ]);

    // Import critical properties list
    const { CRITICAL_SYNC_PROPERTIES } = await import(
      path.resolve('./vitest.base.config.ts')
    );

    // Check critical properties only
    let errors = 0;
    console.log(yellow('Checking critical properties:\n'));

    for (const prop of CRITICAL_SYNC_PROPERTIES) {
      const workspaceVal = getValue(workspace, prop);
      const mutationVal = getValue(mutation, prop);
      const baseVal = getValue(base, prop);

      const wsMatch = deepEqual(workspaceVal, baseVal);
      const mutMatch = deepEqual(mutationVal, baseVal);

      console.log(`  ${prop}: ${wsMatch && mutMatch ? green('✅') : red('❌')}`);
      
      if (!wsMatch || !mutMatch) {
        errors++;
        if (!wsMatch) console.log(`    ${red('• Workspace differs from base')}`);
        if (!mutMatch) console.log(`    ${red('• Mutation differs from base')}`);
      }
    }

    // Summary
    console.log(`\n${errors === 0 ? green('✅ PASSED') : red('❌ FAILED')}`);
    console.log(`Checked: ${CRITICAL_SYNC_PROPERTIES.length} properties`);
    console.log(`Errors: ${errors}`);

    if (errors > 0) {
      console.log(red('\nConfigs are out of sync. Fix by updating vitest.base.config.ts'));
      process.exit(1);
    }

  } catch (error) {
    console.error(red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

// Run validation
validateConfigs();
