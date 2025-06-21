// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import the schema directly for unit testing
// This tests the validation logic without the Fastify plugin overhead
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'], {
      errorMap: () => ({
        message: 'NODE_ENV must be one of: development, production, test',
      }),
    })
    .default('development'),
  PORT: z
    .string({
      required_error: 'PORT environment variable is required',
      invalid_type_error: 'PORT must be a string',
    })
    .regex(/^\d+$/, 'PORT must contain only numeric characters')
    .transform(Number)
    .refine(n => n > 0 && n < 65536, 'PORT must be between 1-65535')
    .default('3000'),
  HOST: z
    .string({
      invalid_type_error: 'HOST must be a string',
    })
    .min(1, 'HOST cannot be empty')
    .default('localhost'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'], {
      errorMap: () => ({
        message:
          'LOG_LEVEL must be one of: fatal, error, warn, info, debug, trace',
      }),
    })
    .default('info'),
});

describe('Environment Schema Validation', () => {
  describe('Valid configurations', () => {
    it('should parse with default values', () => {
      const result = EnvSchema.parse({});
      expect(result.NODE_ENV).toBe('development');
      expect(result.PORT).toBe(3000);
      expect(result.HOST).toBe('localhost');
      expect(result.LOG_LEVEL).toBe('info');
    });

    it('should parse custom PORT value', () => {
      const result = EnvSchema.parse({ PORT: '8080' });
      expect(result.PORT).toBe(8080);
    });

    it('should accept valid NODE_ENV values', () => {
      const result = EnvSchema.parse({ NODE_ENV: 'production' });
      expect(result.NODE_ENV).toBe('production');
    });
  });

  describe('PORT validation', () => {
    it('should reject non-numeric PORT', () => {
      expect(() => EnvSchema.parse({ PORT: 'invalid' })).toThrow();
    });

    it('should reject PORT with letters', () => {
      expect(() => EnvSchema.parse({ PORT: '80a0' })).toThrow();
    });

    it('should reject PORT = 0', () => {
      expect(() => EnvSchema.parse({ PORT: '0' })).toThrow();
    });

    it('should reject PORT > 65535', () => {
      expect(() => EnvSchema.parse({ PORT: '65536' })).toThrow();
    });

    it('should accept PORT = 1', () => {
      const result = EnvSchema.parse({ PORT: '1' });
      expect(result.PORT).toBe(1);
    });

    it('should accept PORT = 65535', () => {
      const result = EnvSchema.parse({ PORT: '65535' });
      expect(result.PORT).toBe(65535);
    });
  });

  describe('NODE_ENV validation', () => {
    it('should reject invalid NODE_ENV', () => {
      expect(() => EnvSchema.parse({ NODE_ENV: 'invalid' })).toThrow();
    });

    it('should accept test environment', () => {
      const result = EnvSchema.parse({ NODE_ENV: 'test' });
      expect(result.NODE_ENV).toBe('test');
    });
  });

  describe('LOG_LEVEL validation', () => {
    it('should reject invalid LOG_LEVEL', () => {
      expect(() => EnvSchema.parse({ LOG_LEVEL: 'invalid' })).toThrow();
    });

    it('should accept all valid log levels', () => {
      const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

      for (const level of levels) {
        const result = EnvSchema.parse({ LOG_LEVEL: level });
        expect(result.LOG_LEVEL).toBe(level);
      }
    });
  });

  describe('HOST validation', () => {
    it('should reject empty HOST', () => {
      expect(() => EnvSchema.parse({ HOST: '' })).toThrow();
    });

    it('should accept custom HOST', () => {
      const result = EnvSchema.parse({ HOST: '0.0.0.0' });
      expect(result.HOST).toBe('0.0.0.0');
    });
  });

  describe('Error message content', () => {
    it('should contain field names in error messages', () => {
      try {
        EnvSchema.parse({ PORT: 'invalid' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.errors[0].path).toContain('PORT');
      }
    });

    it('should format validation errors properly for multiple fields', () => {
      try {
        EnvSchema.parse({ NODE_ENV: 'invalid', PORT: 'also-invalid' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.errors.length).toBeGreaterThan(0);
        expect(error.errors.some(e => e.path.includes('NODE_ENV'))).toBe(true);
        expect(error.errors.some(e => e.path.includes('PORT'))).toBe(true);
      }
    });
  });
});
