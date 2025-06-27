import { defineConfig } from 'vitest/config';
import path from 'path';

// Unified configuration for monorepo
export default defineConfig({
  test: {
    // Global test settings
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: false,
      },
    },
    // Include all test files across the monorepo
    include: [
      'apps/*/test/**/*.test.ts',
      'packages/*/test/**/*.test.ts',
      'apps/*/src/**/*.test.ts',
      'packages/*/src/**/*.test.ts',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**',
      '.stryker-tmp/**',
    ],
  },
  // Module resolution for monorepo
  resolve: {
    alias: {
      '@ai-fastify-template/config': path.resolve(
        __dirname,
        'packages/config/src'
      ),
      '@ai-fastify-template/types': path.resolve(
        __dirname,
        'packages/types/src'
      ),
    },
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.jsx': ['.tsx', '.jsx'],
    },
  },
});
