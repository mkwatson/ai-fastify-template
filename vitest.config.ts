import { defineConfig, mergeConfig } from 'vitest/config';
import { baseConfig } from './vitest.base.config';

// Workspace configuration for monorepo testing
export default mergeConfig(
  baseConfig,
  defineConfig({
    // Workspace-specific configuration
    // Note: baseConfig provides all shared settings
  })
);
