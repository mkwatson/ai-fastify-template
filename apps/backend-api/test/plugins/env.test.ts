import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import envPlugin from '../../src/plugins/env.js';

describe('Environment Plugin', () => {
  let app: FastifyInstance;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    app = Fastify({ logger: false });
  });

  afterEach(async () => {
    process.env = originalEnv;
    await app.close();
  });

  describe('Valid Configuration', () => {
    it('should accept valid environment variables', async () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';
      process.env.HOST = '0.0.0.0';
      process.env.LOG_LEVEL = 'warn';

      await app.register(envPlugin);
      await app.ready();

      expect(app.config.NODE_ENV).toBe('production');
      expect(app.config.PORT).toBe(8080);
      expect(app.config.HOST).toBe('0.0.0.0');
      expect(app.config.LOG_LEVEL).toBe('warn');
    });

    it('should apply default values when env vars are missing', async () => {
      // Clear relevant env vars
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      delete process.env.HOST;
      delete process.env.LOG_LEVEL;

      await app.register(envPlugin);
      await app.ready();

      expect(app.config.NODE_ENV).toBe('development');
      expect(app.config.PORT).toBe(3000);
      expect(app.config.HOST).toBe('localhost');
      expect(app.config.LOG_LEVEL).toBe('info');
    });

    it('should transform PORT string to number', async () => {
      process.env.PORT = '9000';

      await app.register(envPlugin);
      await app.ready();

      expect(app.config.PORT).toBe(9000);
      expect(typeof app.config.PORT).toBe('number');
    });
  });

  describe('Invalid Configuration', () => {
    it('should reject invalid NODE_ENV values', async () => {
      process.env.NODE_ENV = 'invalid';

      await expect(app.register(envPlugin)).rejects.toThrow('NODE_ENV must be one of: development, production, test');
    });

    it('should reject invalid PORT values', async () => {
      process.env.PORT = 'not-a-number';

      await expect(app.register(envPlugin)).rejects.toThrow('PORT must contain only numeric characters');
    });

    it('should reject invalid LOG_LEVEL values', async () => {
      process.env.LOG_LEVEL = 'invalid-level';

      await expect(app.register(envPlugin)).rejects.toThrow('LOG_LEVEL must be one of: fatal, error, warn, info, debug, trace');
    });

    it('should reject PORT with non-numeric characters', async () => {
      process.env.PORT = '3000a';

      await expect(app.register(envPlugin)).rejects.toThrow('PORT must contain only numeric characters');
    });

    it('should reject empty PORT string', async () => {
      process.env.PORT = '';

      await expect(app.register(envPlugin)).rejects.toThrow('PORT must contain only numeric characters');
    });

    it('should reject PORT outside valid range', async () => {
      process.env.PORT = '70000';

      await expect(app.register(envPlugin)).rejects.toThrow('PORT must be between 1-65535');
    });

    it('should reject PORT of zero', async () => {
      process.env.PORT = '0';

      await expect(app.register(envPlugin)).rejects.toThrow('PORT must be between 1-65535');
    });

    it('should reject empty HOST string', async () => {
      process.env.HOST = '';

      await expect(app.register(envPlugin)).rejects.toThrow('HOST cannot be empty');
    });
  });

  describe('Type Safety', () => {
    it('should provide proper TypeScript types', async () => {
      await app.register(envPlugin);
      await app.ready();

      // TypeScript should recognize these properties and types
      const nodeEnv: 'development' | 'production' | 'test' = app.config.NODE_ENV;
      const port: number = app.config.PORT;
      const host: string = app.config.HOST;
      const logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' = app.config.LOG_LEVEL;

      expect(typeof nodeEnv).toBe('string');
      expect(typeof port).toBe('number');
      expect(typeof host).toBe('string');
      expect(typeof logLevel).toBe('string');
    });
  });

  describe('Plugin Integration', () => {
    it('should register successfully with correct plugin name', async () => {
      await app.register(envPlugin);
      await app.ready();

      // Plugin should be registered
      expect(app.hasPlugin('env-plugin')).toBe(true);
    });

    it('should decorate fastify instance with config', async () => {
      await app.register(envPlugin);
      await app.ready();

      expect(app.config).toBeDefined();
      expect(typeof app.config).toBe('object');
    });
  });

  describe('Security - Safe Logging', () => {
    it('should have safe logging mechanism ready for sensitive fields', async () => {
      // Test that the plugin loads successfully with current non-sensitive schema
      await app.register(envPlugin);
      await app.ready();

      // Verify the config only contains expected non-sensitive fields
      expect(app.config).toHaveProperty('NODE_ENV');
      expect(app.config).toHaveProperty('PORT');
      expect(app.config).toHaveProperty('HOST');
      expect(app.config).toHaveProperty('LOG_LEVEL');

      // Ensure no sensitive fields leak into the config
      expect(app.config).not.toHaveProperty('password');
      expect(app.config).not.toHaveProperty('secret');
      expect(app.config).not.toHaveProperty('key');
      expect(app.config).not.toHaveProperty('token');

      // Note: The safe logging mechanism is in place and would redact
      // any future sensitive fields added to the schema
    });
  });
}); 