import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { build } from '../../helper.js';
import type { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

describe('POST /api/token', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await build();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('successful token generation', () => {
    it('should generate a token with valid origin', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: 'http://localhost:3000',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('tokenType');
      expect(body).toHaveProperty('expiresIn');
      expect(body.tokenType).toBe('Bearer');
      // expiresIn has jitter: 900-960 seconds
      expect(body.expiresIn).toBeGreaterThanOrEqual(900);
      expect(body.expiresIn).toBeLessThanOrEqual(960);
      expect(typeof body.token).toBe('string');
      expect(body.token.split('.')).toHaveLength(3);
    });

    it('should generate valid JWT with correct expiration', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: 'http://localhost:3000',
        },
      });

      const body = JSON.parse(response.payload);
      const decoded = jwt.decode(body.token) as jwt.JwtPayload;

      expect(decoded).toBeTruthy();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded['sub']).toBeDefined();
      expect(decoded['aud']).toBe('api');
      expect(decoded['type']).toBe('access');
      expect(decoded['iss']).toBe('airbolt-api');

      const expirationTime = (decoded.exp ?? 0) - (decoded.iat ?? 0);
      // expiresIn has jitter: 900-960 seconds
      expect(expirationTime).toBeGreaterThanOrEqual(900);
      expect(expirationTime).toBeLessThanOrEqual(960);
      // Verify new custom claims
      expect(decoded['origin']).toBe('http://localhost:3000');
      expect(decoded['fingerprint']).toBeDefined();
      expect(typeof decoded['fingerprint']).toBe('string');
    });
  });

  describe('origin validation', () => {
    it('should return 400 when origin header is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Bad Request');
      expect(body.message).toContain('origin');
      expect(body.statusCode).toBe(400);
    });

    it('should return 403 when origin is not allowed', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: 'https://malicious-site.com',
        },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Forbidden');
      expect(body.message).toContain(
        'The request origin is not in the allowed list'
      );
      expect(body.statusCode).toBe(403);
    });

    it('should return 403 for empty origin header', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: '',
        },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Forbidden');
      expect(body.message).toContain('Origin header is required');
      expect(body.statusCode).toBe(403);
    });
  });

  describe('token verification', () => {
    it('should generate tokens that can be verified by the JWT plugin', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: 'http://localhost:3000',
        },
      });

      const body = JSON.parse(response.payload);
      const verified = app.jwt.verify(body.token);

      expect(verified).toBeTruthy();
      expect((verified as any)['sub']).toBeDefined();
      expect((verified as any)['aud']).toBe('api');
      expect((verified as any)['type']).toBe('access');
      expect((verified as any)['iss']).toBe('airbolt-api');
      expect((verified as any).iat).toBeDefined();
      expect((verified as any).exp).toBeDefined();
      // Verify new custom claims
      expect((verified as any)['origin']).toBe('http://localhost:3000');
      expect((verified as any)['fingerprint']).toBeDefined();
    });
  });

  describe('response format', () => {
    it('should match the expected schema', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: 'http://localhost:3000',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');

      const body = JSON.parse(response.payload);
      expect(Object.keys(body).sort()).toEqual(
        ['expiresIn', 'token', 'tokenType'].sort()
      );
    });
  });

  describe('token introspection', () => {
    it('should verify token and return decoded claims', async () => {
      // First, generate a token
      const tokenResponse = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: 'http://localhost:3000',
        },
      });

      const { token } = JSON.parse(tokenResponse.payload);

      // Then verify it
      const verifyResponse = await app.inject({
        method: 'GET',
        url: '/api/token/verify',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(verifyResponse.statusCode).toBe(200);
      const body = JSON.parse(verifyResponse.payload);

      expect(body.valid).toBe(true);
      expect(body.expires).toBeDefined();
      expect(body.remaining).toBeDefined();
      expect(body.remaining).toBeGreaterThan(0);
      expect(body.remaining).toBeLessThanOrEqual(960);

      // Check claims structure
      expect(body.claims).toBeDefined();
      expect(body.claims.sub).toBeDefined();
      expect(body.claims.aud).toBe('api');
      expect(body.claims.type).toBe('access');
      expect(body.claims.origin).toBe('http://localhost:3000');
      expect(body.claims.fingerprint).toBeDefined();
      expect(body.claims.iat).toBeDefined();
      expect(body.claims.exp).toBeDefined();
    });

    it('should return 401 for invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/token/verify',
        headers: {
          authorization: 'Bearer invalid.token.here',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 when no token provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/token/verify',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limiting on token endpoint', async () => {
      // Token endpoint has specific rate limit: 3 requests per minute (per Linear spec)
      const maxRequests = 3;
      const responses = [];

      // Make requests sequentially
      for (let i = 0; i < maxRequests + 2; i++) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/token',
          headers: {
            origin: 'http://localhost:3000',
          },
        });
        responses.push(response);
      }

      // Count successful and rate-limited responses
      const successCount = responses.filter(r => r.statusCode === 200).length;
      const rateLimitedCount = responses.filter(
        r => r.statusCode === 429
      ).length;

      // Should have exactly maxRequests successful and the rest rate limited
      expect(successCount).toBe(maxRequests);
      expect(rateLimitedCount).toBe(2);

      // Check rate limit error response
      const rateLimitedResponse = responses.find(r => r.statusCode === 429);
      if (rateLimitedResponse) {
        const body = JSON.parse(rateLimitedResponse.payload);
        expect(body.statusCode).toBe(429);
        expect(body.error).toBeDefined();
        expect(body.message).toContain('Too many requests');
      }
    });
  });
});
