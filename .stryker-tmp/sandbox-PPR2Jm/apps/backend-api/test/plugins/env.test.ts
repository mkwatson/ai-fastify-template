// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { build } from '../helper.js';

describe('Environment Plugin', () => {
  let app: FastifyInstance;
  const originalEnv = process.env;

  beforeEach(async () => {
    // Reset environment
    process.env = { ...originalEnv };
    app = await build();
  });

  afterEach(async () => {
    await app.close();
    process.env = originalEnv;
  });

  describe('Valid configurations', () => {
    it('should load with default values', async () => {
      expect(app.config).toBeDefined();
      expect(app.config.NODE_ENV).toBe('development');
      expect(app.config.PORT).toBe(3000);
      expect(app.config.HOST).toBe('localhost');
      expect(app.config.LOG_LEVEL).toBe('info');
    });

    it('should parse custom PORT value', async () => {
      process.env.PORT = '8080';
      const customApp = await build();
      expect(customApp.config.PORT).toBe(8080);
      await customApp.close();
    });

    it('should accept valid NODE_ENV values', async () => {
      process.env.NODE_ENV = 'production';
      const prodApp = await build();
      expect(prodApp.config.NODE_ENV).toBe('production');
      await prodApp.close();
    });
  });

  describe('PORT validation', () => {
    it('should reject non-numeric PORT', async () => {
      process.env.PORT = 'invalid';
      await expect(build()).rejects.toThrow();
    });

    it('should reject PORT with letters', async () => {
      process.env.PORT = '80a0';
      await expect(build()).rejects.toThrow();
    });

    it('should reject PORT = 0', async () => {
      process.env.PORT = '0';
      await expect(build()).rejects.toThrow();
    });

    it('should reject PORT > 65535', async () => {
      process.env.PORT = '65536';
      await expect(build()).rejects.toThrow();
    });

    it('should accept PORT = 1', async () => {
      process.env.PORT = '1';
      const testApp = await build();
      expect(testApp.config.PORT).toBe(1);
      await testApp.close();
    });

    it('should accept PORT = 65535', async () => {
      process.env.PORT = '65535';
      const testApp = await build();
      expect(testApp.config.PORT).toBe(65535);
      await testApp.close();
    });
  });

  describe('NODE_ENV validation', () => {
    it('should reject invalid NODE_ENV', async () => {
      process.env.NODE_ENV = 'invalid';
      await expect(build()).rejects.toThrow();
    });

    it('should accept test environment', async () => {
      process.env.NODE_ENV = 'test';
      const testApp = await build();
      expect(testApp.config.NODE_ENV).toBe('test');
      await testApp.close();
    });
  });

  describe('LOG_LEVEL validation', () => {
    it('should reject invalid LOG_LEVEL', async () => {
      process.env.LOG_LEVEL = 'invalid';
      await expect(build()).rejects.toThrow();
    });

    it('should accept all valid log levels', async () => {
      const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

      for (const level of levels) {
        process.env.LOG_LEVEL = level;
        const testApp = await build();
        expect(testApp.config.LOG_LEVEL).toBe(level);
        await testApp.close();
      }
    });
  });

  describe('HOST validation', () => {
    it('should reject empty HOST', async () => {
      process.env.HOST = '';
      await expect(build()).rejects.toThrow();
    });

    it('should accept custom HOST', async () => {
      process.env.HOST = '0.0.0.0';
      const testApp = await build();
      expect(testApp.config.HOST).toBe('0.0.0.0');
      await testApp.close();
    });
  });

  describe('Error message content', () => {
    it('should contain field names in error messages', async () => {
      process.env.PORT = 'invalid';

      try {
        await build();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('PORT');
      }
    });

    it('should format validation errors properly', async () => {
      process.env.NODE_ENV = 'invalid';
      process.env.PORT = 'also-invalid';

      try {
        await build();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Environment validation failed');
      }
    });
  });
});
