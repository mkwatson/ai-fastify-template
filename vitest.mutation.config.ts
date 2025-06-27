/**
 * Separate Vitest config for mutation testing
 * Required due to Stryker incompatibility with Vitest workspace mode
 * TODO: Remove when https://github.com/stryker-mutator/stryker-js/issues/[workspace-support] is fixed
 *
 * This config disables workspace mode and directly includes test files,
 * which allows Stryker to properly create its sandbox and run mutation tests.
 */
import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';
import path from 'path';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      // Disable workspace mode for Stryker compatibility
      workspace: undefined,

      // Directly include test files instead of using workspace
      include: [
        'apps/backend-api/test/**/*.test.ts',
        'packages/*/test/**/*.test.ts',
      ],

      // Ensure single thread for mutation testing consistency
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: true,
          isolate: false,
        },
      },
    },

    // Module resolution for monorepo packages
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
      // Handle .js extensions in ESM imports
      extensionAlias: {
        '.js': ['.ts', '.js'],
        '.jsx': ['.tsx', '.jsx'],
      },
    },
  })
);
