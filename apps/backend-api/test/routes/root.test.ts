import { type FastifyInstance } from 'fastify';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { build } from '../helper.js';

describe('Root routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /', () => {
    it('should return hello world message', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');

      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        message: 'Hello World!',
      });
    });

    it('should have proper response headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers).toHaveProperty('content-length');
    });

    it('should handle HEAD requests', async () => {
      const response = await app.inject({
        method: 'HEAD',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe('');
      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for unsupported methods on root', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
