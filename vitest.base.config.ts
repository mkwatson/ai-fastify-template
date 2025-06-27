/**
 * Shared Vitest configuration base
 * 
 * ⚠️  CRITICAL: This is the single source of truth for shared Vitest settings.
 * Any changes to these properties MUST be synchronized across all configs.
 * 
 * Run `pnpm test:config:verify` after making changes to ensure consistency.
 */
import path from 'path';
import type { InlineConfig } from 'vitest';

export const baseConfig: InlineConfig = {
  test: {
    // Global test settings - MUST be identical across all configs
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    hookTimeout: 10000,

    // Pool configuration for test execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    // Test file patterns - these are the defaults, can be overridden
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

  // Module resolution for monorepo - MUST be identical
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
};

/**
 * Properties that MUST be synchronized across all Vitest configs
 */
export const CRITICAL_SYNC_PROPERTIES = [
  'test.globals',
  'test.environment',
  'test.testTimeout',
  'test.hookTimeout',
  'resolve.alias',
  'resolve.extensionAlias',
] as const;

/**
 * Properties that CAN differ between configs
 */
export const ALLOWED_DIFFERENCES = [
  'test.workspace',
  'test.include',
  'test.pool',
  'test.poolOptions',
] as const;