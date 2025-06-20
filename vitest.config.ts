import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['apps/**/test/**/*.test.ts'],
    exclude: [
      'node_modules/',
      'build/',
      'dist/',
      'coverage/',
      '**/*.d.ts',
      '**/*.config.*',
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