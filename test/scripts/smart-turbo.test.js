import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// We'll test the smart-turbo script by running it as a subprocess
// This approach tests the actual behavior without needing to refactor the script

describe('smart-turbo.js (Enhanced)', () => {
  const scriptPath = join(process.cwd(), 'scripts', 'smart-turbo.js');
  const testConfigPath = '.test-turbo-config.json';

  beforeEach(() => {
    // Ensure the script exists
    if (!existsSync(scriptPath)) {
      throw new Error(`Script not found at ${scriptPath}`);
    }
  });

  afterEach(() => {
    // Clean up test config if it exists
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
  });

  describe('command parsing', () => {
    it('should show enhanced help with --help flag', () => {
      const result = execSync(`node ${scriptPath} --help`, {
        encoding: 'utf-8',
      });

      expect(result).toContain(
        'Smart Turbo - Dynamic Task Execution (Enhanced)'
      );
      expect(result).toContain('USAGE:');
      expect(result).toContain('TASKS:');
      expect(result).toContain('OPTIONS:');
      expect(result).toContain('CONFIGURATION:');
      expect(result).toContain('EXAMPLES:');
      expect(result).toContain('FEATURES:');
      expect(result).toContain('--config=<path>');
    });

    it('should show error when no task provided', () => {
      try {
        execSync(`node ${scriptPath}`, {
          encoding: 'utf-8',
          stdio: 'pipe',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.stdout).toContain('Please specify a task to run');
        expect(error.status).toBe(1);
      }
    });
  });

  describe('git reference validation', () => {
    it('should accept valid git references', () => {
      const validRefs = [
        'main',
        'develop',
        'feature/test-branch',
        'fix/issue-123',
        'v1.0.0',
        'HEAD',
        'HEAD^1',
        'HEAD~2',
        'origin/main',
      ];

      // Test dry-run with valid refs shouldn't error on ref validation
      validRefs.forEach(ref => {
        const result = execSync(
          `node ${scriptPath} lint --base=${ref} --dry-run`,
          {
            encoding: 'utf-8',
          }
        );
        // Should not contain "Invalid git reference"
        expect(result).not.toContain('Invalid git reference');
      });
    });

    it('should reject invalid git references', () => {
      const invalidRefs = [
        'main; rm -rf /',
        'main && echo hacked',
        'main | cat /etc/passwd',
        '$(whoami)',
        '`date`',
        'main\nrm -rf /',
      ];

      invalidRefs.forEach(ref => {
        try {
          execSync(`node ${scriptPath} lint --base="${ref}" --dry-run`, {
            encoding: 'utf-8',
            stdio: 'pipe',
          });
          expect.fail(`Should have rejected invalid ref: ${ref}`);
        } catch (error) {
          expect(error.stderr || error.stdout).toContain(
            'Invalid git reference'
          );
        }
      });
    });
  });

  describe('task execution modes', () => {
    it('should run selective tasks by default', () => {
      const result = execSync(`node ${scriptPath} lint --dry-run`, {
        encoding: 'utf-8',
      });

      expect(result).toContain('turbo run --dry-run text lint');
    });

    it('should force all packages with --force-all', () => {
      const result = execSync(`node ${scriptPath} lint --force-all --dry-run`, {
        encoding: 'utf-8',
      });

      expect(result).toContain('turbo run --dry-run text lint');
      expect(result).toContain('all-packages');
    });

    it('should always run safety-critical tasks on all packages', () => {
      const result = execSync(`node ${scriptPath} test:mutation --dry-run`, {
        encoding: 'utf-8',
      });

      expect(result).toContain('turbo run --dry-run text test:mutation');
      expect(result).toContain('all-packages');
    });
  });

  describe('performance logging', () => {
    it('should log execution summary', () => {
      const result = execSync(`node ${scriptPath} lint --dry-run`, {
        encoding: 'utf-8',
      });

      expect(result).toContain('Smart Turbo Execution Summary');
      expect(result).toContain('Task: lint');
      expect(result).toContain('Scope:');
      expect(result).toContain('Duration:');
    });
  });

  describe('error handling', () => {
    it('should handle non-existent git base gracefully', () => {
      const result = execSync(
        `node ${scriptPath} lint --base=non-existent-ref-xyz --dry-run`,
        {
          encoding: 'utf-8',
        }
      );

      expect(result).toContain(
        "Git reference 'non-existent-ref-xyz' not found"
      );
      expect(result).toContain('using standard execution');
    });
  });

  describe('configuration support', () => {
    it('should use custom configuration file', () => {
      const customConfig = {
        defaultBase: 'develop',
        logPerformance: true,
        performanceLogging: {
          enabled: true,
          includeGitTiming: true,
          includeTurboTiming: true,
          includePackageMetrics: true,
        },
      };

      writeFileSync(testConfigPath, JSON.stringify(customConfig, null, 2));

      const result = execSync(
        `node ${scriptPath} lint --config=${testConfigPath} --dry-run`,
        {
          encoding: 'utf-8',
        }
      );

      expect(result).toContain('Smart Turbo Execution Summary');
      expect(result).toContain('Duration:');
    });

    it('should handle invalid configuration gracefully', () => {
      writeFileSync(testConfigPath, '{ invalid json }');

      const result = execSync(
        `node ${scriptPath} lint --config=${testConfigPath} --dry-run`,
        {
          encoding: 'utf-8',
        }
      );

      // Should still work with fallback to defaults
      expect(result).toContain('turbo run --dry-run text lint');
    });
  });

  describe('enhanced performance metrics', () => {
    it('should show detailed performance breakdown', () => {
      const result = execSync(`node ${scriptPath} lint --dry-run`, {
        encoding: 'utf-8',
      });

      expect(result).toContain('Smart Turbo Execution Summary');
      expect(result).toContain('Task: lint');
      expect(result).toContain('Scope:');
      expect(result).toContain('Duration:');
    });

    it('should handle different task types with proper scope', () => {
      // Test selective task
      const selectiveResult = execSync(`node ${scriptPath} lint --dry-run`, {
        encoding: 'utf-8',
      });
      expect(selectiveResult).toContain('Task: lint');

      // Test always-all task
      const alwaysAllResult = execSync(
        `node ${scriptPath} test:mutation --dry-run`,
        {
          encoding: 'utf-8',
        }
      );
      expect(alwaysAllResult).toContain('Task: test:mutation');
      expect(alwaysAllResult).toContain('all-packages');
    });
  });

  describe('cross-package dependency scenarios', () => {
    it('should handle config package changes correctly', () => {
      // This is an integration test that would benefit from actual git changes
      // In a real scenario, we'd make changes to packages/config and verify
      // that the smart turbo correctly identifies the changed package
      const result = execSync(`node ${scriptPath} lint --dry-run`, {
        encoding: 'utf-8',
      });

      // Should execute successfully regardless of current git state
      expect(result).toContain('turbo run --dry-run text lint');
      expect(result).toContain('Smart Turbo Execution Summary');
    });

    it('should force all packages when --force-all is used', () => {
      const result = execSync(`node ${scriptPath} lint --force-all --dry-run`, {
        encoding: 'utf-8',
      });

      expect(result).toContain('turbo run --dry-run text lint');
      expect(result).toContain('all-packages');
    });
  });

  describe('modular architecture validation', () => {
    it('should load git operations module correctly', () => {
      // Verify that the script can import and use the git operations module
      const result = execSync(`node ${scriptPath} lint --dry-run`, {
        encoding: 'utf-8',
      });

      // Should not have any import errors and should complete successfully
      expect(result).not.toContain('Error');
      expect(result).not.toContain('MODULE_NOT_FOUND');
      expect(result).toContain('Smart Turbo Execution Summary');
    });

    it('should validate that modules are properly integrated', () => {
      // Test that all modules work together
      const result = execSync(`node ${scriptPath} --help`, {
        encoding: 'utf-8',
      });

      // Should show enhanced help indicating modular features
      expect(result).toContain('Modular architecture');
      expect(result).toContain('External configuration file support');
      expect(result).toContain('Enhanced performance metrics');
    });
  });
});
