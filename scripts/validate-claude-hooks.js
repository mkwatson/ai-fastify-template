#!/usr/bin/env node

/**
 * Validates Claude Code hooks configuration
 * Ensures hooks remain compatible with project structure and scripts
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Failed to load ${filePath}: ${error.message}`);
  }
}

function extractCommands(hooks) {
  const commands = [];

  const processHook = hook => {
    if (hook.hooks) {
      hook.hooks.forEach(h => {
        if (h.type === 'command' && h.command) {
          commands.push(h.command);
        }
      });
    }
  };

  Object.values(hooks).forEach(hookArray => {
    if (Array.isArray(hookArray)) {
      hookArray.forEach(processHook);
    }
  });

  return commands;
}

function extractScriptReferences(commands) {
  const scriptPattern = /pnpm\s+([a-z0-9:_-]+)/gi;
  const scripts = new Set();

  commands.forEach(cmd => {
    let match;
    while ((match = scriptPattern.exec(cmd)) !== null) {
      // Exclude flags and npm registry commands
      if (!match[1].startsWith('-') && !match[1].includes('@')) {
        scripts.add(match[1]);
      }
    }
  });

  return Array.from(scripts);
}

function validateScripts(claudeScripts, packageScripts) {
  const errors = [];
  const warnings = [];

  claudeScripts.forEach(script => {
    if (!packageScripts[script]) {
      // Check if it's a built-in pnpm command or a direct binary
      const builtinCommands = ['install', 'add', 'remove', 'update', 'audit'];
      const directBinaries = ['prettier', 'eslint', 'tsc', 'node', 'npx', 'nx'];

      if (
        !builtinCommands.includes(script) &&
        !directBinaries.includes(script)
      ) {
        errors.push(
          `Script "${script}" referenced in hooks but not found in package.json`
        );
      }
    }
  });

  return { errors, warnings };
}

function validateSecurityPatterns(commands) {
  const errors = [];
  const warnings = [];

  // Check for proper path resolution in security hooks
  const securityCommands = commands.filter(
    cmd => cmd.includes('BLOCKED') || cmd.includes('exit 1')
  );

  securityCommands.forEach(cmd => {
    if (cmd.includes('$TOOL_FILE_PATH') && !cmd.includes('realpath')) {
      warnings.push('Security hook should use realpath for path resolution');
    }

    if (cmd.includes('.env') && !cmd.includes('..')) {
      warnings.push('Env protection should also check for path traversal');
    }
  });

  // Verify comprehensive directory coverage
  const protectedDirs = [
    'node_modules',
    'dist',
    '.git',
    '.nx',
    'build',
    'coverage',
  ];
  const systemDirCommands = commands.find(
    cmd => cmd.includes('node_modules') && cmd.includes('BLOCKED')
  );

  if (systemDirCommands) {
    protectedDirs.forEach(dir => {
      if (!systemDirCommands.includes(dir)) {
        warnings.push(`Consider adding ${dir} to system directory protection`);
      }
    });
  }

  return { errors, warnings };
}

function validatePerformance(commands) {
  const warnings = [];

  // Check for timeout usage
  const validationCommands = commands.filter(cmd => cmd.includes('ai:quick'));
  validationCommands.forEach(cmd => {
    if (!cmd.includes('timeout')) {
      warnings.push(
        'Validation commands should use timeout to prevent hanging'
      );
    }
  });

  // Check for command consolidation
  const editHooks = commands.filter(
    cmd =>
      cmd.includes('prettier') ||
      cmd.includes('Utils modified') ||
      cmd.includes('Test modified')
  );

  if (editHooks.length > 1 && !editHooks[0].includes('&&')) {
    warnings.push(
      'Consider consolidating multiple Edit|Write hooks for better performance'
    );
  }

  return warnings;
}

function validateHookStructure(settings) {
  const errors = [];
  const requiredHookTypes = ['PostToolUse', 'PreToolUse'];

  requiredHookTypes.forEach(type => {
    if (!settings.hooks[type]) {
      errors.push(`Missing required hook type: ${type}`);
    }
  });

  // Validate hook matchers
  const validMatchers = ['Edit', 'Write', 'MultiEdit', 'Bash', 'Read'];
  Object.values(settings.hooks).forEach(hookArray => {
    if (Array.isArray(hookArray)) {
      hookArray.forEach(hook => {
        if (hook.matcher) {
          const matchers = hook.matcher.split('|');
          matchers.forEach(m => {
            if (!validMatchers.includes(m)) {
              warnings.push(`Unknown matcher: ${m}`);
            }
          });
        }
      });
    }
  });

  return errors;
}

async function main() {
  log('🔍 Validating Claude Code hooks configuration...', 'blue');

  try {
    // Load configuration files
    const settingsPath = join(projectRoot, '.claude-code', 'settings.json');
    const packagePath = join(projectRoot, 'package.json');

    if (!existsSync(settingsPath)) {
      throw new Error('.claude-code/settings.json not found');
    }

    const settings = loadJson(settingsPath);
    const packageJson = loadJson(packagePath);

    // Extract and analyze
    const commands = extractCommands(settings.hooks);
    const referencedScripts = extractScriptReferences(commands);

    log(`\n📋 Found ${commands.length} hook commands`, 'blue');
    log(`📦 Found ${referencedScripts.length} script references\n`, 'blue');

    // Run validations
    const structureErrors = validateHookStructure(settings);
    const { errors: scriptErrors, warnings: scriptWarnings } = validateScripts(
      referencedScripts,
      packageJson.scripts
    );
    const { errors: securityErrors, warnings: securityWarnings } =
      validateSecurityPatterns(commands);
    const performanceWarnings = validatePerformance(commands);

    // Collect all issues
    const allErrors = [...structureErrors, ...scriptErrors, ...securityErrors];
    const allWarnings = [
      ...scriptWarnings,
      ...securityWarnings,
      ...performanceWarnings,
    ];

    // Report results
    if (allErrors.length > 0) {
      log('❌ Errors:', 'red');
      allErrors.forEach(error => log(`  - ${error}`, 'red'));
    }

    if (allWarnings.length > 0) {
      log('\n⚠️  Warnings:', 'yellow');
      allWarnings.forEach(warning => log(`  - ${warning}`, 'yellow'));
    }

    if (allErrors.length === 0 && allWarnings.length === 0) {
      log('✅ All validations passed!', 'green');
    }

    // Additional checks
    log('\n📊 Configuration Summary:', 'blue');
    log(`  - Hook types: ${Object.keys(settings.hooks).join(', ')}`);
    log(
      `  - Security blocks: ${commands.filter(c => c.includes('BLOCKED')).length}`
    );
    log(
      `  - Validation hooks: ${commands.filter(c => c.includes('ai:quick')).length}`
    );
    log(
      `  - Formatting hooks: ${commands.filter(c => c.includes('prettier')).length}`
    );

    // Exit with error if validation failed
    if (allErrors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Validation failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
