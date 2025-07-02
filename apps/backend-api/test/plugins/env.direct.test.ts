import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { randomBytes } from 'node:crypto';

// Direct import to ensure mutation coverage
import envPlugin from '../../src/plugins/env.js';

describe('Environment Plugin Direct Tests', () => {
  const validApiKey = 'sk-test1234567890abcdef';

  it('should successfully register with valid environment', async () => {
    const app = Fastify({ logger: false });
    // Ensure clean environment
    const env = {
      NODE_ENV: 'test',
      PORT: '3001',
      HOST: 'localhost',
      LOG_LEVEL: 'info',
      OPENAI_API_KEY: validApiKey,
      JWT_SECRET: randomBytes(32).toString('hex'),
      ALLOWED_ORIGIN: 'http://localhost:5173',
      SYSTEM_PROMPT: 'Test prompt',
      RATE_LIMIT_MAX: '100',
      RATE_LIMIT_TIME_WINDOW: '60000',
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
      expect(app.config?.OPENAI_API_KEY).toBe(validApiKey);
      expect(app.config?.JWT_SECRET).toBeDefined();
      expect(app.config?.ALLOWED_ORIGIN).toEqual(['http://localhost:5173']);
      expect(app.config?.SYSTEM_PROMPT).toBe('Test prompt');
      expect(app.config?.RATE_LIMIT_MAX).toBe(100);
      expect(app.config?.RATE_LIMIT_TIME_WINDOW).toBe(60000);
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });

  it('should provide config after successful registration', async () => {
    const app = Fastify({ logger: false });
    // Test with valid environment to exercise the success path
    const env = {
      NODE_ENV: 'development',
      PORT: '3000',
      HOST: 'localhost',
      LOG_LEVEL: 'info',
      OPENAI_API_KEY: validApiKey,
      // JWT_SECRET will be auto-generated in development
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
      expect(app.config?.OPENAI_API_KEY).toBe(validApiKey);
      expect(app.config?.JWT_SECRET).toBeDefined(); // Auto-generated
      expect(app.config?.ALLOWED_ORIGIN).toEqual(['http://localhost:5173']);
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });

  it('should use default values when env vars not set', async () => {
    const app = Fastify({ logger: false });
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: validApiKey, // Required
    };

    // Remove optional env vars to test defaults
    delete process.env['NODE_ENV'];
    delete process.env['PORT'];
    delete process.env['HOST'];
    delete process.env['LOG_LEVEL'];
    delete process.env['JWT_SECRET'];
    delete process.env['ALLOWED_ORIGIN'];
    delete process.env['SYSTEM_PROMPT'];
    delete process.env['RATE_LIMIT_MAX'];
    delete process.env['RATE_LIMIT_TIME_WINDOW'];

    try {
      await app.register(envPlugin);
      await app.ready();

      // Check defaults are applied
      expect(app.config).toBeDefined();
      expect(app.config?.NODE_ENV).toBe('development');
      expect(app.config?.PORT).toBe(3000);
      expect(app.config?.HOST).toBe('localhost');
      expect(app.config?.LOG_LEVEL).toBe('info');
      expect(app.config?.JWT_SECRET).toBeDefined(); // Auto-generated in dev
      expect(app.config?.ALLOWED_ORIGIN).toEqual(['http://localhost:5173']);
      expect(app.config?.SYSTEM_PROMPT).toBe('');
      expect(app.config?.RATE_LIMIT_MAX).toBe(60);
      expect(app.config?.RATE_LIMIT_TIME_WINDOW).toBe(100000);
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
      process.env = {
        ...originalEnv,
        NODE_ENV: value,
        OPENAI_API_KEY: validApiKey,
        JWT_SECRET:
          value === 'production' ? randomBytes(32).toString('hex') : undefined,
      };

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
    const app = Fastify({ logger: false });
    const jwtSecret = randomBytes(32).toString('hex');
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      PORT: '8080',
      HOST: '0.0.0.0',
      LOG_LEVEL: 'warn',
      OPENAI_API_KEY: validApiKey,
      JWT_SECRET: jwtSecret, // Required in production
      ALLOWED_ORIGIN: 'https://example.com,https://app.example.com',
    };

    try {
      await app.register(envPlugin);
      await app.ready();

      expect(app.config).toBeDefined();
      expect(app.config?.NODE_ENV).toBe('production');
      expect(app.config?.PORT).toBe(8080);
      expect(app.config?.HOST).toBe('0.0.0.0');
      expect(app.config?.LOG_LEVEL).toBe('warn');
      expect(app.config?.JWT_SECRET).toBe(jwtSecret);
      expect(app.config?.ALLOWED_ORIGIN).toEqual([
        'https://example.com',
        'https://app.example.com',
      ]);
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });

  it('should auto-generate JWT_SECRET in development mode', async () => {
    const app = Fastify({ logger: false });
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NODE_ENV: 'development',
      OPENAI_API_KEY: validApiKey,
      // No JWT_SECRET provided
    };
    delete process.env['JWT_SECRET'];

    try {
      await app.register(envPlugin);
      await app.ready();

      expect(app.config).toBeDefined();
      expect(app.config?.JWT_SECRET).toBeDefined();
      expect(app.config?.JWT_SECRET?.length).toBeGreaterThanOrEqual(64); // 32 bytes hex = 64 chars
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });

  it('should require JWT_SECRET in production mode', async () => {
    const app = Fastify({ logger: false });
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      OPENAI_API_KEY: validApiKey,
      // No JWT_SECRET provided
    };
    delete process.env['JWT_SECRET'];

    await expect(app.register(envPlugin).ready()).rejects.toThrow(
      'JWT_SECRET is required in production'
    );

    process.env = originalEnv;
  });

  it('should parse comma-separated allowed origins', async () => {
    const app = Fastify({ logger: false });
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: validApiKey,
      ALLOWED_ORIGIN:
        'https://example.com, http://localhost:3000, https://app.example.com',
    };

    try {
      await app.register(envPlugin);
      await app.ready();

      expect(app.config?.ALLOWED_ORIGIN).toEqual([
        'https://example.com',
        'http://localhost:3000',
        'https://app.example.com',
      ]);
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });

  it('should validate OPENAI_API_KEY format', async () => {
    const app = Fastify({ logger: false });
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: 'invalid-key-format',
    };

    await expect(app.register(envPlugin).ready()).rejects.toThrow(
      'OPENAI_API_KEY'
    );

    process.env = originalEnv;
  });

  it('should redact sensitive configuration values in logs', async () => {
    // Create a custom logger to capture log output
    const logs: any[] = [];
    const logger = {
      fatal: (obj: any, msg?: string) => logs.push({ level: 'fatal', obj, msg }),
      error: (obj: any, msg?: string) => logs.push({ level: 'error', obj, msg }),
      warn: (obj: any, msg?: string) => logs.push({ level: 'warn', obj, msg }),
      info: (obj: any, msg?: string) => logs.push({ level: 'info', obj, msg }),
      debug: (obj: any, msg?: string) => logs.push({ level: 'debug', obj, msg }),
      trace: (obj: any, msg?: string) => logs.push({ level: 'trace', obj, msg }),
      child: () => logger,
    };

    const app = Fastify({ logger });
    const jwtSecret = randomBytes(32).toString('hex');
    const originalEnv = process.env;
    
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      OPENAI_API_KEY: validApiKey,
      JWT_SECRET: jwtSecret,
    };

    try {
      await app.register(envPlugin);
      await app.ready();

      // Find the log entry with config
      const configLog = logs.find(
        log => log.msg === 'Environment configuration loaded' && log.obj?.config
      );

      expect(configLog).toBeDefined();
      expect(configLog.obj.config.OPENAI_API_KEY).toBe('[REDACTED]');
      expect(configLog.obj.config.JWT_SECRET).toBe('[REDACTED]');
      expect(configLog.obj.config.NODE_ENV).toBe('test'); // Non-sensitive should not be redacted
      expect(configLog.obj.config.PORT).toBe(3000); // Non-sensitive should not be redacted
    } finally {
      process.env = originalEnv;
      await app.close();
    }
  });
});
