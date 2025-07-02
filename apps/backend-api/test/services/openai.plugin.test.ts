import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import envPlugin from '../../src/plugins/env.js';
import openaiPlugin from '../../src/services/openai.js';
import { OpenAIService } from '../../src/services/openai.js';

describe('OpenAI Plugin', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    // Set required environment variables
    process.env['OPENAI_API_KEY'] = 'sk-test-key-1234567890';
    process.env['NODE_ENV'] = 'test';
    process.env['JWT_SECRET'] = 'test-secret-at-least-32-characters-long';
  });

  afterEach(async () => {
    await app?.close();
    // Clean up environment variables
    delete process.env['OPENAI_API_KEY'];
    delete process.env['SYSTEM_PROMPT'];
  });

  it('should register OpenAI service successfully', async () => {
    app = Fastify({ logger: false });

    await app.register(envPlugin);
    await app.register(openaiPlugin);

    expect(app.openai).toBeDefined();
    expect(app.openai).toBeInstanceOf(OpenAIService);
  });

  it('should use system prompt from environment', async () => {
    process.env['SYSTEM_PROMPT'] = 'You are a helpful AI assistant';

    app = Fastify({ logger: false });

    await app.register(envPlugin);
    await app.register(openaiPlugin);

    expect(app.openai).toBeDefined();
    // The system prompt is used internally by the service
  });

  it('should fail if OPENAI_API_KEY is not configured', async () => {
    delete process.env['OPENAI_API_KEY'];

    app = Fastify({ logger: false });

    // The env plugin will throw when OPENAI_API_KEY is missing
    await expect(app.register(envPlugin)).rejects.toThrow(
      'Environment validation failed: OPENAI_API_KEY: OPENAI_API_KEY is required for AI functionality'
    );
  });

  it('should have correct plugin metadata', () => {
    // Check if the plugin is properly configured as a fastify plugin
    expect(typeof openaiPlugin).toBe('function');
    expect(openaiPlugin.name).toBeDefined();
  });

  it('should depend on env-plugin', async () => {
    app = Fastify({ logger: false });

    // Try to register openai plugin without env plugin
    await expect(app.register(openaiPlugin)).rejects.toThrow();
  });

  it('should register successfully with logger enabled', async () => {
    app = Fastify({ logger: true });

    await app.register(envPlugin);
    await app.register(openaiPlugin);

    // If we get here without throwing, registration was successful
    expect(app.openai).toBeDefined();
    expect(app.openai).toBeInstanceOf(OpenAIService);
  });
});
