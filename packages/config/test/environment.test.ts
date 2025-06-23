import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getEnvironment,
  isDevelopment,
  isProduction,
} from '../src/environment.js';

describe('environment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getEnvironment', () => {
    it('should return development as default', () => {
      delete process.env.NODE_ENV;
      expect(getEnvironment()).toBe('development');
    });

    it('should return production when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(getEnvironment()).toBe('production');
    });

    it('should return test when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      expect(getEnvironment()).toBe('test');
    });

    it('should return development for unknown NODE_ENV values', () => {
      process.env.NODE_ENV = 'staging';
      expect(getEnvironment()).toBe('development');
    });
  });

  describe('isDevelopment', () => {
    it('should return true in development', () => {
      process.env.NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
    });

    it('should return false in production', () => {
      process.env.NODE_ENV = 'production';
      expect(isDevelopment()).toBe(false);
    });

    it('should return true when NODE_ENV is unset', () => {
      delete process.env.NODE_ENV;
      expect(isDevelopment()).toBe(true);
    });
  });

  describe('isProduction', () => {
    it('should return true in production', () => {
      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
    });

    it('should return false in development', () => {
      process.env.NODE_ENV = 'development';
      expect(isProduction()).toBe(false);
    });

    it('should return false when NODE_ENV is unset', () => {
      delete process.env.NODE_ENV;
      expect(isProduction()).toBe(false);
    });
  });
});
