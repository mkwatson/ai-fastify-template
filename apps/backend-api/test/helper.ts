// This file contains code that we reuse between our tests.
import Fastify, { type FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import App, { type AppOptions } from '../src/app.js';

// Default test configuration
const defaultConfig: Partial<AppOptions> = {
  logger: false, // Disable logging in tests for cleaner output
};

/**
 * Build a Fastify app instance for testing
 * This replaces the fastify-cli helper for better Vitest integration
 */
export async function build(config: Partial<AppOptions> = {}): Promise<FastifyInstance> {
  const app = Fastify({
    ...defaultConfig,
    ...config,
  });

  // Register our application
  await app.register(fp(App));

  // Ensure the app is ready before returning
  await app.ready();

  return app;
}

/**
 * Create a test app instance with automatic cleanup
 * Use this in test suites that need lifecycle management
 */
export async function createTestApp(config: Partial<AppOptions> = {}): Promise<{
  app: FastifyInstance;
  cleanup: () => Promise<void>;
}> {
  const app = await build(config);

  const cleanup = async () => {
    await app.close();
  };

  return { app, cleanup };
}

/**
 * Helper for testing route responses
 */
export async function injectRequest(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  payload?: unknown
) {
  return app.inject({
    method,
    url,
    payload,
  });
}

// Legacy exports for backwards compatibility with existing tests
export { build as default };
export const config = () => defaultConfig;
