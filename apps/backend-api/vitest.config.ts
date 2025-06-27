import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: ['.stryker-tmp/**', 'node_modules/**'],
    pool: 'threads',
  },
  resolve: {
    alias: {
      '@ai-fastify-template/config': path.resolve(
        __dirname,
        '../../packages/config/src'
      ),
      '@ai-fastify-template/types': path.resolve(
        __dirname,
        '../../packages/types/src'
      ),
    },
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    },
  },
});
