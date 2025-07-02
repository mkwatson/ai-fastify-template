import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import envPlugin from '../../src/plugins/env.js';
import jwtPlugin from '../../src/plugins/jwt.js';

describe('JWT Plugin', () => {
  const buildTestApp = async (envOverrides?: Record<string, string>) => {
    const app = Fastify({
      logger: false,
    });

    // Mock environment variables
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      OPENAI_API_KEY: 'sk-test-key',
      JWT_SECRET: 'test-secret-key-for-jwt-signing-32-chars',
      ALLOWED_ORIGIN: 'http://localhost:3000',
      ...envOverrides,
    };

    await app.register(envPlugin);
    await app.register(jwtPlugin);

    return app;
  };

  describe('Plugin Registration', () => {
    it('should register successfully with valid JWT_SECRET', async () => {
      const app = await buildTestApp();
      expect(app.jwt).toBeDefined();
      expect(app.jwt.sign).toBeInstanceOf(Function);
      expect(app.jwt.verify).toBeInstanceOf(Function);
      await app.close();
    });

    it('should fail registration without JWT_SECRET', async () => {
      const app = Fastify({ logger: false });

      // Mock environment without JWT_SECRET
      process.env = {
        NODE_ENV: 'production',
        OPENAI_API_KEY: 'sk-test-key',
        ALLOWED_ORIGIN: 'http://localhost:3000',
      };

      await expect(app.register(envPlugin)).rejects.toThrow(
        'JWT_SECRET is required in production'
      );
      await app.close();
    });

    it('should declare correct TypeScript types', async () => {
      const app = await buildTestApp();

      // TypeScript will validate these at compile time
      const _sign: (payload: object) => string = app.jwt.sign;
      const _verify: (token: string) => {
        userId?: string;
        iat: number;
        exp: number;
      } = app.jwt.verify;

      expect(_sign).toBeDefined();
      expect(_verify).toBeDefined();
      await app.close();
    });
  });

  describe('Token Generation', () => {
    it('should generate a valid JWT token', async () => {
      const app = await buildTestApp();
      const payload = { userId: 'test-user-123' };

      const token = app.jwt.sign(payload);

      expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);

      // Verify token structure without using app.jwt.verify
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe('test-user-123');
      expect(decoded.iat).toBeGreaterThan(0);
      expect(decoded.exp).toBeGreaterThan(decoded.iat);

      await app.close();
    });

    it('should set 15-minute expiration', async () => {
      const app = await buildTestApp();
      const payload = { userId: 'test-user' };

      const token = app.jwt.sign(payload);
      const decoded = jwt.decode(token) as any;

      const expirationTime = (decoded.exp - decoded.iat) / 60; // Convert to minutes
      expect(expirationTime).toBe(15);

      await app.close();
    });

    it('should use HS256 algorithm', async () => {
      const app = await buildTestApp();
      const payload = { userId: 'test-user' };

      const token = app.jwt.sign(payload);
      const header = jwt.decode(token, { complete: true })?.header;

      expect(header?.alg).toBe('HS256');

      await app.close();
    });
  });

  describe('Token Verification', () => {
    it('should verify a valid token', async () => {
      const app = await buildTestApp();
      const payload = { userId: 'test-user-123' };

      const token = app.jwt.sign(payload);
      const verified = app.jwt.verify(token);

      expect((verified as any).userId).toBe('test-user-123');
      expect((verified as any).iat).toBeGreaterThan(0);
      expect((verified as any).exp).toBeGreaterThan((verified as any).iat);

      await app.close();
    });

    it('should throw unauthorized error for invalid token', async () => {
      const app = await buildTestApp();

      expect(() => app.jwt.verify('invalid-token')).toThrow();

      try {
        app.jwt.verify('invalid-token');
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toMatch(/Invalid token|malformed/i);
      }

      await app.close();
    });

    it('should throw unauthorized error for expired token', async () => {
      const app = await buildTestApp();

      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: 'test-user' },
        'test-secret-key-for-jwt-signing-32-chars',
        { expiresIn: '-1s' }
      );

      expect(() => app.jwt.verify(expiredToken)).toThrow('Token expired');

      try {
        app.jwt.verify(expiredToken);
      } catch (error: any) {
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Token expired');
      }

      await app.close();
    });

    it('should throw error for token signed with different secret', async () => {
      const app = await buildTestApp();

      const tokenWithDifferentSecret = jwt.sign(
        { userId: 'test-user' },
        'different-secret-key-not-matching-32ch',
        { expiresIn: '15m' }
      );

      expect(() => app.jwt.verify(tokenWithDifferentSecret)).toThrowError(
        /token signature is invalid/i
      );

      await app.close();
    });

    it('should only accept HS256 algorithm', async () => {
      const app = await buildTestApp();

      // Try to create a token with a different algorithm
      const tokenWithDifferentAlg = jwt.sign(
        { userId: 'test-user' },
        'test-secret-key-for-jwt-signing-32-chars',
        { algorithm: 'HS512' as any }
      );

      expect(() => app.jwt.verify(tokenWithDifferentAlg)).toThrowError(
        /token algorithm is invalid/i
      );

      await app.close();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty payload', async () => {
      const app = await buildTestApp();

      const token = app.jwt.sign({});
      const verified = app.jwt.verify(token);

      expect((verified as any).userId).toBeUndefined();
      expect((verified as any).iat).toBeGreaterThan(0);
      expect((verified as any).exp).toBeGreaterThan((verified as any).iat);

      await app.close();
    });

    it('should handle complex payload', async () => {
      const app = await buildTestApp();
      const complexPayload = {
        userId: 'user-123',
        roles: ['admin', 'user'],
        metadata: {
          email: 'test@example.com',
          preferences: {
            theme: 'dark',
            language: 'en',
          },
        },
      };

      const token = app.jwt.sign(complexPayload);
      const verified = app.jwt.verify(token);

      expect((verified as any).userId).toBe('user-123');
      expect((verified as any).roles).toEqual(['admin', 'user']);
      expect((verified as any).metadata).toEqual(complexPayload.metadata);

      await app.close();
    });

    it('should handle malformed tokens gracefully', async () => {
      const app = await buildTestApp();

      const malformedTokens = [
        '',
        ' ',
        'not.a.token',
        'header.payload',
        'header.payload.signature.extra',
        null,
        undefined,
      ];

      for (const malformed of malformedTokens) {
        expect(() => app.jwt.verify(malformed as any)).toThrow();
      }

      await app.close();
    });
  });

  describe('Security Considerations', () => {
    it('should not expose JWT_SECRET in errors', async () => {
      const app = await buildTestApp();

      try {
        app.jwt.verify('invalid-token');
      } catch (error: any) {
        expect(error.message).not.toContain('test-secret-key');
        expect(error.message).toMatch(/Invalid token|malformed/i);
      }

      await app.close();
    });

    it('should prevent none algorithm attack', async () => {
      const app = await buildTestApp();

      // Create a token with 'none' algorithm (security vulnerability if accepted)
      const header = Buffer.from(
        JSON.stringify({ alg: 'none', typ: 'JWT' })
      ).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({ userId: 'attacker' })
      ).toString('base64url');
      const maliciousToken = `${header}.${payload}.`;

      expect(() => app.jwt.verify(maliciousToken)).toThrowError(/token signature is missing/i);

      await app.close();
    });
  });
});
