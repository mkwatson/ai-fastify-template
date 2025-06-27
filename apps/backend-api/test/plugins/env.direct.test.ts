import { describe, it, expect, beforeEach } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';

// Direct import to ensure mutation coverage
import envPlugin from '../../src/plugins/env.js';

describe('Environment Plugin Direct Tests', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = Fastify({ logger: false });
  });

  it('should successfully register with valid environment', async () => {
    // Ensure clean environment
    const env = {
      NODE_ENV: 'test',
      PORT: '3001',
      HOST: 'localhost',
      LOG_LEVEL: 'info',
    };

    // Temporarily override process.env
    const originalEnv = process.env;
    process.env = { ...originalEnv, ...env };

    try {
      await app.register(envPlugin);
      await app.ready();

      // Verify config was set
      expect(app.config).toBeDefined();
      expect(app.config?.NODE_ENV).toBe('test');
      expect(app.config?.PORT).toBe(3001);
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });

  it('should provide config after successful registration', async () => {
    // Test with valid environment to exercise the success path
    const env = {
      NODE_ENV: 'development',
      PORT: '3000',
      HOST: 'localhost',
      LOG_LEVEL: 'info',
    };

    const originalEnv = process.env;
    process.env = { ...originalEnv, ...env };

    try {
      await app.register(envPlugin);
      await app.ready();

      // Exercise config access paths
      expect(app.config).toBeDefined();
      expect(app.config?.NODE_ENV).toBe('development');
      expect(app.config?.PORT).toBe(3000);
      expect(app.config?.HOST).toBe('localhost');
      expect(app.config?.LOG_LEVEL).toBe('info');
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });

  it('should use default values when env vars not set', async () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv };

    // Remove optional env vars to test defaults
    delete process.env['NODE_ENV'];
    delete process.env['PORT'];
    delete process.env['HOST'];
    delete process.env['LOG_LEVEL'];

    try {
      await app.register(envPlugin);
      await app.ready();

      // Check defaults are applied
      expect(app.config).toBeDefined();
      expect(app.config?.NODE_ENV).toBe('development');
      expect(app.config?.PORT).toBe(3000);
      expect(app.config?.HOST).toBe('localhost');
      expect(app.config?.LOG_LEVEL).toBe('info');
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });

  it('should accept all valid NODE_ENV values', async () => {
    const originalEnv = process.env;
    const validValues = ['development', 'production', 'test'];

    for (const value of validValues) {
      const testApp = Fastify({ logger: false });
      process.env = { ...originalEnv, NODE_ENV: value };

      try {
        await testApp.register(envPlugin);
        await testApp.ready();
        expect(testApp.config).toBeDefined();
        expect(testApp.config?.NODE_ENV).toBe(value);
      } finally {
        await testApp.close();
      }
    }

    process.env = originalEnv;
  });

  it('should handle production environment correctly', async () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      PORT: '8080',
      HOST: '0.0.0.0',
      LOG_LEVEL: 'warn',
    };

    try {
      await app.register(envPlugin);
      await app.ready();

      expect(app.config).toBeDefined();
      expect(app.config?.NODE_ENV).toBe('production');
      expect(app.config?.PORT).toBe(8080);
      expect(app.config?.HOST).toBe('0.0.0.0');
      expect(app.config?.LOG_LEVEL).toBe('warn');
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });
});
