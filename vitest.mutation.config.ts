/**
 * Separate Vitest config for mutation testing
 * Required due to Stryker incompatibility with Vitest workspace mode
 * TODO: Remove when https://github.com/stryker-mutator/stryker-js/issues/[workspace-support] is fixed
 *
 * ⚠️  WARNING: This config MUST stay synchronized with vitest.base.config.ts
 *
 * Shared properties are imported from vitest.base.config.ts to ensure consistency.
 * Only mutation-testing-specific overrides are defined here.
 *
 * Run `pnpm test:config:verify` after making changes to ensure consistency.
 */
import { defineConfig, mergeConfig } from 'vitest/config';
import { baseConfig } from './vitest.base.config';

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

    // Note: resolve config is inherited from baseConfig
    // This ensures module resolution stays synchronized
  })
);
