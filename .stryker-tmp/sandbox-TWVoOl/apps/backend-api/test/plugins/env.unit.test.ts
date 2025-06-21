// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';

// Direct import of the env plugin to ensure mutation coverage
import envPlugin from '../../src/plugins/env.js';

describe('Environment Plugin Unit Tests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify({ logger: false });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should register env plugin successfully with valid environment', async () => {
    // Set valid environment
    const originalNodeEnv = process.env.NODE_ENV;
    const originalPort = process.env.PORT;
    const originalHost = process.env.HOST;
    const originalLogLevel = process.env.LOG_LEVEL;

    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001';
    process.env.HOST = 'localhost';
    process.env.LOG_LEVEL = 'info';

    try {
      await app.register(envPlugin);
      await app.ready();

      // Verify config is available
      expect(app.config).toBeDefined();
      expect(app.config.NODE_ENV).toBe('test');
      expect(app.config.PORT).toBe(3001);
      expect(app.config.HOST).toBe('localhost');
      expect(app.config.LOG_LEVEL).toBe('info');
    } finally {
      // Restore original environment
      process.env.NODE_ENV = originalNodeEnv;
      process.env.PORT = originalPort;
      process.env.HOST = originalHost;
      process.env.LOG_LEVEL = originalLogLevel;
    }
  });

  it('should reject invalid NODE_ENV', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'invalid';

    try {
      await expect(async () => {
        await app.register(envPlugin);
        await app.ready();
      }).rejects.toThrow('Environment validation failed');
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }, 10000);

  it('should reject invalid PORT', async () => {
    const originalPort = process.env.PORT;
    process.env.PORT = 'not-a-number';

    try {
      await expect(async () => {
        await app.register(envPlugin);
        await app.ready();
      }).rejects.toThrow('Environment validation failed');
    } finally {
      process.env.PORT = originalPort;
    }
  }, 10000);

  it('should reject PORT out of range', async () => {
    const originalPort = process.env.PORT;
    process.env.PORT = '70000';

    try {
      await expect(async () => {
        await app.register(envPlugin);
        await app.ready();
      }).rejects.toThrow('Environment validation failed');
    } finally {
      process.env.PORT = originalPort;
    }
  }, 10000);

  it('should reject empty HOST', async () => {
    const originalHost = process.env.HOST;
    process.env.HOST = '';

    try {
      await expect(async () => {
        await app.register(envPlugin);
        await app.ready();
      }).rejects.toThrow('Environment validation failed');
    } finally {
      process.env.HOST = originalHost;
    }
  }, 10000);

  it('should reject invalid LOG_LEVEL', async () => {
    const originalLogLevel = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'invalid';

    try {
      await expect(async () => {
        await app.register(envPlugin);
        await app.ready();
      }).rejects.toThrow('Environment validation failed');
    } finally {
      process.env.LOG_LEVEL = originalLogLevel;
    }
  }, 10000);
});