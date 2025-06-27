import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getPort,
  getHost,
  DEFAULT_PORT,
  DEFAULT_HOST,
} from '../src/server-config.js';

describe('server-config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getPort', () => {
    it('should return default port when PORT is not set', () => {
      delete process.env['PORT'];
      expect(getPort()).toBe(DEFAULT_PORT);
    });

    it('should return parsed port when PORT is valid', () => {
      process.env['PORT'] = '8080';
      expect(getPort()).toBe(8080);
    });

    it('should throw error for invalid port values', () => {
      process.env['PORT'] = 'invalid';
      expect(() => getPort()).toThrow('Invalid PORT value: invalid');
    });

    it('should throw error for negative port', () => {
      process.env['PORT'] = '-1';
      expect(() => getPort()).toThrow('Invalid PORT value: -1');
    });

    it('should throw error for port too large', () => {
      process.env['PORT'] = '65536';
      expect(() => getPort()).toThrow('Invalid PORT value: 65536');
    });

    it('should accept valid port range', () => {
      process.env['PORT'] = '1';
      expect(getPort()).toBe(1);

      process.env['PORT'] = '65535';
      expect(getPort()).toBe(65535);
    });
  });

  describe('getHost', () => {
    it('should return default host when HOST is not set', () => {
      delete process.env['HOST'];
      expect(getHost()).toBe(DEFAULT_HOST);
    });

    it('should return environment host when set', () => {
      process.env['HOST'] = '0.0.0.0';
      expect(getHost()).toBe('0.0.0.0');
    });

    it('should handle empty HOST value', () => {
      process.env['HOST'] = '';
      expect(getHost()).toBe(DEFAULT_HOST);
    });
  });
});
