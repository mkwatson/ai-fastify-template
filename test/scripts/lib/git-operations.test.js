import { describe, it, expect } from 'vitest';
import {
  sanitizeGitRef,
  checkGitBase,
  analyzeChangedPackages,
  getRepoInfo,
} from '../../../scripts/lib/git-operations.js';

describe('git-operations.js', () => {
  describe('sanitizeGitRef', () => {
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

      validRefs.forEach(ref => {
        expect(() => sanitizeGitRef(ref)).not.toThrow();
        expect(sanitizeGitRef(ref)).toBe(ref);
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
        'main;',
        'main&&',
        'main||',
      ];

      invalidRefs.forEach(ref => {
        expect(() => sanitizeGitRef(ref)).toThrow('Invalid git reference');
      });
    });
  });

  describe('checkGitBase', () => {
    it('should return true for existing git references', () => {
      // HEAD should always exist in a git repository
      expect(checkGitBase('HEAD')).toBe(true);
    });

    it('should return false for non-existent git references', () => {
      expect(checkGitBase('non-existent-ref-xyz-123')).toBe(false);
    });

    it('should handle invalid git references', () => {
      expect(checkGitBase('main; rm -rf /')).toBe(false);
    });
  });

  describe('analyzeChangedPackages', () => {
    it('should return no changes for empty file list', () => {
      const result = analyzeChangedPackages([]);
      expect(result).toEqual({
        packages: [],
        reason: 'no-changes',
      });
    });

    it('should detect app changes', () => {
      const files = [
        'apps/backend-api/src/server.ts',
        'apps/backend-api/package.json',
      ];
      const result = analyzeChangedPackages(files);

      expect(result.packages).toEqual(['./apps/backend-api']);
      expect(result.reason).toBe('package-changes');
      expect(result.totalFiles).toBe(2);
    });

    it('should detect package changes', () => {
      const files = [
        'packages/config/src/index.ts',
        'packages/config/package.json',
      ];
      const result = analyzeChangedPackages(files);

      expect(result.packages).toEqual(['./packages/config']);
      expect(result.reason).toBe('package-changes');
      expect(result.totalFiles).toBe(2);
    });

    it('should detect multiple package changes', () => {
      const files = [
        'apps/backend-api/src/server.ts',
        'packages/config/src/index.ts',
        'packages/utils/src/helpers.ts',
      ];
      const result = analyzeChangedPackages(files);

      expect(result.packages).toContain('./apps/backend-api');
      expect(result.packages).toContain('./packages/config');
      expect(result.packages).toContain('./packages/utils');
      expect(result.reason).toBe('package-changes');
    });

    it('should return all packages for root-level changes', () => {
      const files = ['package.json', 'turbo.json', 'README.md'];
      const result = analyzeChangedPackages(files);

      expect(result.packages).toEqual(['all']);
      expect(result.reason).toBe('root-changes');
      expect(result.files).toEqual(['package.json']);
      expect(result.totalFiles).toBe(3);
    });

    it('should handle mixed changes with root files', () => {
      const files = [
        'apps/backend-api/src/server.ts',
        'package.json', // Root change triggers all packages
        'packages/config/src/index.ts',
      ];
      const result = analyzeChangedPackages(files);

      expect(result.packages).toEqual(['all']);
      expect(result.reason).toBe('root-changes');
      expect(result.files).toEqual(['package.json']);
    });
  });

  describe('getRepoInfo', () => {
    it('should return repository information', () => {
      const info = getRepoInfo();

      if (info.success) {
        expect(info.branch).toBeDefined();
        expect(info.lastCommit).toBeDefined();
        expect(typeof info.branch).toBe('string');
        expect(typeof info.lastCommit).toBe('string');
      } else {
        expect(info.error).toBeDefined();
      }
    });
  });

  describe('integration tests', () => {
    it('should handle cross-package dependencies correctly', () => {
      // Test scenario: config package change should affect backend-api
      const configChange = ['packages/config/src/server-config.ts'];
      const result = analyzeChangedPackages(configChange);

      // Should detect config package change
      expect(result.packages).toEqual(['./packages/config']);
      expect(result.reason).toBe('package-changes');

      // Note: In a real implementation, we might want to also include
      // dependent packages (like backend-api that imports from config)
      // This would require analyzing the actual dependency graph
    });

    it('should handle workspace configuration changes', () => {
      const workspaceFiles = [
        'pnpm-workspace.yaml',
        'turbo.json',
        'package.json',
      ];

      workspaceFiles.forEach(file => {
        const result = analyzeChangedPackages([file]);
        expect(result.packages).toEqual(['all']);
        expect(result.reason).toBe('root-changes');
      });
    });

    it('should handle build tool configuration changes', () => {
      const buildFiles = [
        'eslint.config.js',
        'tsconfig.json',
        'vitest.config.ts',
      ];

      buildFiles.forEach(file => {
        const result = analyzeChangedPackages([file]);
        expect(result.packages).toEqual(['all']);
        expect(result.reason).toBe('root-changes');
      });
    });
  });
});
