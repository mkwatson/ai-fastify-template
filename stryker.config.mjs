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
  ],
  checkers: ['typescript'],
  tsconfigFile: 'apps/backend-api/tsconfig.json',
  thresholds: {
    high: 90,
    low: 80,
    break: 60, // Temporary: Will increase to 90% in next iteration
  },
  tempDirName: '.stryker-tmp',
  cleanTempDir: true,
};

export default config;
