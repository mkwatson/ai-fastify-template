import { defineConfig } from 'vitest/config';

// Unified workspace configuration
export default defineConfig({
  test: {
    // Global test settings
    globals: true,
    environment: 'node',

    // Use workspace configuration for project-specific settings
    workspace: './vitest.workspace.ts',

    // Global configuration for all projects
    testTimeout: 10000,
    hookTimeout: 10000,

    // Use tsx for TypeScript runtime support
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: false,
      },
    },
  },
});
