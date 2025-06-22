import { describe, it, expect, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

// We'll test the smart-turbo script by running it as a subprocess
// This approach tests the actual behavior without needing to refactor the script

describe('smart-turbo.js', () => {
  const scriptPath = join(process.cwd(), 'scripts', 'smart-turbo.js');

  beforeEach(() => {
    // Ensure the script exists
    if (!existsSync(scriptPath)) {
      throw new Error(`Script not found at ${scriptPath}`);
    }
  });

  describe('command parsing', () => {
    it('should show help with --help flag', () => {
      const result = execSync(`node ${scriptPath} --help`, {
        encoding: 'utf-8',
      });

      expect(result).toContain('Smart Turbo - Dynamic Task Execution');
      expect(result).toContain('USAGE:');
      expect(result).toContain('TASKS:');
      expect(result).toContain('OPTIONS:');
      expect(result).toContain('EXAMPLES:');
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
});
