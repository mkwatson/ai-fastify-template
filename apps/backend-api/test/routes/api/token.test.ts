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
          origin: 'http://localhost:5173',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('tokenType');
      expect(body).toHaveProperty('expiresIn');
      expect(body.tokenType).toBe('Bearer');
      expect(body.expiresIn).toBe(900);
      expect(typeof body.token).toBe('string');
      expect(body.token.split('.')).toHaveLength(3);
    });

    it('should accept case-insensitive origin matching', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: 'HTTP://LOCALHOST:5173',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('token');
    });

    it('should generate valid JWT with correct expiration', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: 'http://localhost:5173',
        },
      });

      const body = JSON.parse(response.payload);
      const decoded = jwt.decode(body.token) as jwt.JwtPayload;

      expect(decoded).toBeTruthy();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();

      const expirationTime = (decoded.exp ?? 0) - (decoded.iat ?? 0);
      expect(expirationTime).toBe(900);
    });
  });

  describe('origin validation', () => {
    it('should return 403 when origin header is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.payload);
      expect(body).toEqual({
        error: 'ORIGIN_NOT_ALLOWED',
        message: 'Origin header is required',
        statusCode: 403,
      });
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
      expect(body).toEqual({
        error: 'ORIGIN_NOT_ALLOWED',
        message: 'The request origin is not in the allowed list',
        statusCode: 403,
      });
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
      expect(body).toEqual({
        error: 'ORIGIN_NOT_ALLOWED',
        message: 'Origin header is required',
        statusCode: 403,
      });
    });
  });

  describe('token verification', () => {
    it('should generate tokens that can be verified by the JWT plugin', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: 'http://localhost:5173',
        },
      });

      const body = JSON.parse(response.payload);
      const verified = app.jwt.verify(body.token);

      expect(verified).toBeTruthy();
      expect((verified as any).iat).toBeDefined();
      expect((verified as any).exp).toBeDefined();
    });
  });

  describe('response format', () => {
    it('should match the expected schema', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          origin: 'http://localhost:5173',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');

      const body = JSON.parse(response.payload);
      expect(Object.keys(body).sort()).toEqual(['expiresIn', 'token', 'tokenType'].sort());
    });
  });

  describe('rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      // Make requests sequentially to ensure rate limiting kicks in
      const maxRequests = 60; // Default RATE_LIMIT_MAX
      const responses = [];

      // Make requests sequentially
      for (let i = 0; i < maxRequests + 5; i++) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/token',
          headers: {
            origin: 'http://localhost:5173',
          },
        });
        responses.push(response);
      }

      // Count successful and rate-limited responses
      const successCount = responses.filter(r => r.statusCode === 200).length;
      const rateLimitedCount = responses.filter(
        r => r.statusCode === 429
      ).length;

      // Should have some successful requests and some rate limited
      expect(successCount).toBeLessThanOrEqual(maxRequests);
      expect(successCount).toBeGreaterThan(0);
      expect(rateLimitedCount).toBeGreaterThan(0);

      // Check rate limit error response
      const rateLimitedResponse = responses.find(r => r.statusCode === 429);
      if (rateLimitedResponse) {
        const body = JSON.parse(rateLimitedResponse.payload);
        expect(body.error).toBe('RATE_LIMIT_EXCEEDED');
        expect(body.message).toContain(
          'Too many requests'
        );
        expect(body.statusCode).toBe(429);
      }
    });
  });
});
