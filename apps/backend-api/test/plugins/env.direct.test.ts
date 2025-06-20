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
      expect(app.config.NODE_ENV).toBe('test');
      expect(app.config.PORT).toBe(3001);
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
      expect(app.config.NODE_ENV).toBe('development');
      expect(app.config.PORT).toBe(3000);
      expect(app.config.HOST).toBe('localhost');
      expect(app.config.LOG_LEVEL).toBe('info');
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });
});