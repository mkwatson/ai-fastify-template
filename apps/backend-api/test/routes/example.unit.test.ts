import { describe, it, expect, afterEach } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';

// Direct import of the example route to ensure mutation coverage
import exampleRoute from '../../src/routes/example/index.js';

describe('Example Route Unit Tests', () => {
  let app: FastifyInstance;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should register example route successfully', async () => {
    app = Fastify({ logger: false });
    await app.register(exampleRoute);
    await app.ready();

    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe('this is an example');
  });

  it('should return plain text response', async () => {
    app = Fastify({ logger: false });
    await app.register(exampleRoute);
    await app.ready();

    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);
    expect(response.payload).toBe('this is an example');
    expect(response.headers['content-type']).toMatch(/text\/plain/);
  });

  it('should handle string return value', async () => {
    app = Fastify({ logger: false });
    await app.register(exampleRoute);
    await app.ready();

    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(typeof response.payload).toBe('string');
    expect(response.payload.length).toBeGreaterThan(0);
    expect(response.payload).toContain('example');
  });
});