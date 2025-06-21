// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  _comment:
    "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
  packageManager: 'pnpm',
  plugins: [
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
  ],
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'vitest',
  testRunnerNodeArgs: ['--import', 'tsx/esm'],
  coverageAnalysis: 'perTest',
  mutate: [
    'apps/backend-api/src/**/*.ts',
    '!apps/backend-api/src/**/*.{test,spec}.ts',
    '!apps/backend-api/src/**/*.d.ts',
    '!apps/backend-api/src/server.ts', // Exclude bootstrap file
    '!apps/backend-api/src/app.ts', // Focus on business logic
    '!apps/backend-api/src/plugins/env.ts:84-106', // Error formatting - low business value for mutation testing
  ],
  checkers: ['typescript'],
  tsconfigFile: './apps/backend-api/tsconfig.json',
  ignoreStatic: true, // Ignore static mutants for performance
  thresholds: {
    high: 90, // High quality threshold - matches MAR-17 requirements
    low: 80, // Low quality threshold - matches MAR-17 coverage requirement
    break: 90, // Build fails below 90% - enforces MAR-17 mutation score requirement
  },
  tempDirName: '.stryker-tmp',
  cleanTempDir: true,
};

export default config;
