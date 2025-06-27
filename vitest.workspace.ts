import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Backend API - Main application tests
  {
    test: {
      name: 'backend-api',
      environment: 'node',
      include: [
        'apps/backend-api/test/**/*.test.ts',
        'apps/backend-api/src/**/*.test.ts',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['apps/backend-api/src/**/*.ts'],
        exclude: [
          'node_modules/',
          'dist/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/coverage/**',
          'apps/backend-api/src/server.ts', // Server entry points
          'apps/backend-api/src/app.ts', // App bootstrapping
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
  },

  // Config Package - Configuration utilities
  {
    test: {
      name: 'config',
      environment: 'node',
      include: [
        'packages/config/test/**/*.test.ts',
        'packages/config/src/**/*.test.ts',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['packages/config/src/**/*.ts'],
        exclude: [
          'node_modules/',
          'dist/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/coverage/**',
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
    },
  },

  // Types Package - Branded types and utilities
  {
    test: {
      name: 'types',
      environment: 'node',
      include: [
        'packages/types/test/**/*.test.ts',
        'packages/types/src/**/*.test.ts',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['packages/types/src/**/*.ts'],
        exclude: [
          'dist',
          'test',
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/index.ts', // Re-exports only
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
    },
  },
]);
