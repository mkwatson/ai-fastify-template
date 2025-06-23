import { describe, it, expect, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import {
  loadConfig,
  generateExampleConfig,
  getConfigInfo,
} from '../../../scripts/lib/config.js';

describe('config.js', () => {
  const testConfigPath = '.test-turbo-smart.json';

  afterEach(() => {
    // Clean up test config file if it exists
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
  });

  describe('loadConfig', () => {
    it('should return default configuration when no external config exists', () => {
      const config = loadConfig();

      expect(config.defaultBase).toBe('main');
      expect(config.alwaysRunAll).toContain('test:mutation');
      expect(config.alwaysRunAll).toContain('build');
      expect(config.selectiveTasks).toContain('lint');
      expect(config.selectiveTasks).toContain('type-check');
      expect(config.logPerformance).toBe(true);
    });

    it('should load and merge external configuration', () => {
      const customConfig = {
        defaultBase: 'develop',
        logPerformance: false,
        selectiveTasks: ['lint', 'test', 'custom-task'],
        performanceLogging: {
          enabled: false,
          includeGitTiming: false,
        },
      };

      writeFileSync(testConfigPath, JSON.stringify(customConfig, null, 2));
      const config = loadConfig(testConfigPath);

      expect(config.defaultBase).toBe('develop');
      expect(config.logPerformance).toBe(false);
      expect(config.selectiveTasks).toContain('custom-task');
      expect(config.performanceLogging.enabled).toBe(false);
      expect(config.performanceLogging.includeGitTiming).toBe(false);

      // Should still have default values for unspecified fields
      expect(config.alwaysRunAll).toContain('test:mutation');
      expect(config.git.maxDiffFiles).toBeDefined();
    });

    it('should handle invalid JSON gracefully', () => {
      writeFileSync(testConfigPath, '{ invalid json }');
      const config = loadConfig(testConfigPath);

      // Should fall back to defaults
      expect(config.defaultBase).toBe('main');
    });

    it('should validate configuration and reject invalid configs', () => {
      const invalidConfig = {
        defaultBase: '', // Invalid: empty string
        alwaysRunAll: 'not-an-array', // Invalid: should be array
        selectiveTasks: ['lint', 123], // Invalid: contains non-string
        logPerformance: 'yes', // Invalid: should be boolean
      };

      writeFileSync(testConfigPath, JSON.stringify(invalidConfig, null, 2));
      const config = loadConfig(testConfigPath);

      // Should fall back to defaults due to validation failure
      expect(config.defaultBase).toBe('main');
      expect(Array.isArray(config.alwaysRunAll)).toBe(true);
      expect(Array.isArray(config.selectiveTasks)).toBe(true);
      expect(typeof config.logPerformance).toBe('boolean');
    });

    it('should handle nested configuration merging correctly', () => {
      const customConfig = {
        git: {
          maxDiffFiles: 500, // Override just one git setting
        },
        performanceLogging: {
          includeGitTiming: false, // Override just one performance setting
        },
      };

      writeFileSync(testConfigPath, JSON.stringify(customConfig, null, 2));
      const config = loadConfig(testConfigPath);

      expect(config.git.maxDiffFiles).toBe(500);
      expect(config.git.timeoutMs).toBe(10000); // Should keep default
      expect(config.performanceLogging.includeGitTiming).toBe(false);
      expect(config.performanceLogging.enabled).toBe(true); // Should keep default
    });
  });

  describe('generateExampleConfig', () => {
    it('should generate valid JSON configuration', () => {
      const example = generateExampleConfig();
      expect(() => JSON.parse(example)).not.toThrow();

      const parsed = JSON.parse(example);
      expect(parsed.defaultBase).toBeDefined();
      expect(parsed.alwaysRunAll).toBeDefined();
      expect(parsed.selectiveTasks).toBeDefined();
      expect(parsed._comments).toBeDefined();
    });
  });

  describe('getConfigInfo', () => {
    it('should return configuration metadata', () => {
      const info = getConfigInfo();

      expect(info.config).toBeDefined();
      expect(info.loadedFrom).toBeDefined();
      expect(typeof info.isDefault).toBe('boolean');
    });

    it('should detect custom configuration file', () => {
      const customConfig = { defaultBase: 'custom' };
      writeFileSync('.turbo-smart.json', JSON.stringify(customConfig, null, 2));

      const info = getConfigInfo();

      expect(info.isDefault).toBe(false);
      expect(info.loadedFrom).toBe('.turbo-smart.json');
      expect(info.config.defaultBase).toBe('custom');

      unlinkSync('.turbo-smart.json');
    });
  });

  describe('configuration validation edge cases', () => {
    it('should handle git configuration validation', () => {
      const invalidGitConfig = {
        git: {
          maxDiffFiles: -1, // Invalid: negative number
          timeoutMs: 'not-a-number', // Invalid: not a number
        },
      };

      writeFileSync(testConfigPath, JSON.stringify(invalidGitConfig, null, 2));
      const config = loadConfig(testConfigPath);

      // Should fall back to defaults
      expect(config.git.maxDiffFiles).toBe(1000);
      expect(config.git.timeoutMs).toBe(10000);
    });

    it('should accept valid custom task configurations', () => {
      const validConfig = {
        alwaysRunAll: ['build', 'deploy', 'security-scan'],
        selectiveTasks: ['lint', 'format', 'unit-test'],
        git: {
          maxDiffFiles: 2000,
          timeoutMs: 15000,
        },
      };

      writeFileSync(testConfigPath, JSON.stringify(validConfig, null, 2));
      const config = loadConfig(testConfigPath);

      expect(config.alwaysRunAll).toEqual(['build', 'deploy', 'security-scan']);
      expect(config.selectiveTasks).toEqual(['lint', 'format', 'unit-test']);
      expect(config.git.maxDiffFiles).toBe(2000);
      expect(config.git.timeoutMs).toBe(15000);
    });
  });
});
