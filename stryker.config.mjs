// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'pnpm',
  plugins: ['@stryker-mutator/vitest-runner'],
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'vitest',
  testRunnerNodeArgs: ['--import', 'tsx/esm'],
  coverageAnalysis: 'perTest',

  // Ignore patterns for Stryker
  ignorePatterns: [
    'node_modules',
    '.stryker-tmp',
    'dist',
    'coverage',
    'test/scripts/**', // Exclude script tests that have external dependencies
  ],

  // Focus on high-value business logic only
  mutate: [
    'apps/backend-api/src/utils/calculations.ts',
    'apps/backend-api/src/utils/validators.ts',
    'apps/backend-api/src/utils/formatters.ts',
  ],

  // Disable TypeScript checking due to monorepo complexity
  // Tests will catch type errors anyway
  disableTypeChecks: true,

  // Thresholds for AI-generated code
  thresholds: {
    high: 90, // Excellent - what we aim for
    low: 80, // Acceptable minimum
    break: 90, // Build fails below 90% - enforces quality requirement
  },

  // Performance optimizations
  concurrency: 4,
  tempDirName: '.stryker-tmp',
  cleanTempDir: true,

  // Use mutation-specific Vitest config
  vitest: {
    configFile: './vitest.mutation.config.ts',
  },
};

export default config;
