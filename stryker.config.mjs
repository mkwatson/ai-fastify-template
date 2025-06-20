// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  _comment:
    "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
  packageManager: "pnpm",
  reporters: ["html", "clear-text", "progress", "dashboard"],
  testRunner: "vitest",
  testRunnerNodeArgs: ["--experimental-vm-modules"],
  coverageAnalysis: "perTest",
  mutate: [
    "apps/backend-api/src/**/*.ts",
    "!apps/backend-api/src/**/*.test.ts",
    "!apps/backend-api/src/**/*.spec.ts",
    "!apps/backend-api/src/**/*.d.ts",
    "!apps/backend-api/src/types/**",
  ],
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  thresholds: {
    high: 90,
    low: 80,
    break: 90, // Fail the build if mutation score is below 90%
  },
  tempDirName: ".stryker-tmp",
  cleanTempDir: true,
  dashboard: {
    project: "github.com/mkwatson/ai-fastify-template",
    version: "main",
    module: "ai-fastify-template",
    reportType: "full",
  },
  vitest: {
    configFile: "./vitest.config.ts",
    dir: ".",
  },
};

export default config;