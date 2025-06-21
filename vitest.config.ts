import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    target: 'node18',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['apps/backend-api/test/**/*.test.ts'],
    // Use tsx for TypeScript runtime support
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        // Enable TypeScript support with tsx
        isolate: false,
      },
    },
    exclude: [
      'node_modules/',
      'build/',
      'dist/',
      'coverage/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/node_modules/**',
      '**/@fastify/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['apps/**/src/**/*.ts'],
      exclude: [
        'node_modules/',
        'build/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'apps/**/src/server.ts', // Server entry points
        'apps/**/src/app.ts', // App bootstrapping
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
