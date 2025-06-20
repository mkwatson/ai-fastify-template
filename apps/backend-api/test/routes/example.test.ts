import { type FastifyInstance } from 'fastify';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { build } from '../helper.js';

describe('Example routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /example', () => {
    it('should return example message', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/example',
      });

      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe('this is an example');
      expect(response.headers['content-type']).toContain('text/plain');
    });

    it('should handle HEAD requests', async () => {
      const response = await app.inject({
        method: 'HEAD',
        url: '/example',
      });

      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe('');
    });
  });

  describe('Error handling', () => {
    it('should return 405 for unsupported methods', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/example',
      });

      expect(response.statusCode).toBe(405);
    });

    it('should return 404 for sub-paths', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/example/sub-path',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
