// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  _comment:
    'Enterprise-grade Stryker configuration template for TypeScript/Fastify/Vitest monorepos',

  // Package manager configuration
  packageManager: 'pnpm',

  // Required plugins for TypeScript + Vitest
  plugins: [
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
  ],

  // Test runner configuration
  testRunner: 'vitest',
  testRunnerNodeArgs: ['--import', 'tsx/esm'], // Critical for TypeScript ESM support
  coverageAnalysis: 'perTest', // Optimal performance for most projects

  // Mutation targets - customize for your project structure
  mutate: [
    'apps/backend-api/src/**/*.ts', // Target all source TypeScript files
    '!apps/backend-api/src/**/*.{test,spec}.ts', // Exclude test files
    '!apps/backend-api/src/**/*.d.ts', // Exclude type definitions
    '!apps/backend-api/src/server.ts', // Exclude bootstrap files
    '!apps/backend-api/src/app.ts', // Exclude app configuration
    // Add project-specific exclusions here:
    // '!apps/backend-api/src/plugins/env.ts:84-106', // Example: error formatting exclusion
  ],

  // Type checking for better performance
  checkers: ['typescript'],
  tsconfigFile: './apps/backend-api/tsconfig.json',

  // Performance optimizations
  ignoreStatic: true, // Skip static mutants
  cleanTempDir: true, // Clean up after runs
  tempDirName: '.stryker-tmp',

  // Enterprise-grade quality thresholds
  thresholds: {
    high: 90, // High quality threshold - aim for this
    low: 80, // Low quality threshold - minimum coverage
    break: 90, // Build fails below this - enforces quality gates
  },

  // Reporting configuration
  reporters: ['html', 'clear-text', 'progress'],

  // Optional: Dashboard reporting (requires API key)
  // dashboard: {
  //   project: 'github.com/your-org/your-repo',
  //   version: 'main'
  // }
};

export default config;

/*
USAGE INSTRUCTIONS:

1. Install required dependencies:
   pnpm add -Dw @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker tsx

2. Customize the mutate patterns for your project structure:
   - Update file paths to match your src directory
   - Add exclusions for bootstrap files, configuration, etc.
   - Document rationale for each exclusion

3. Adjust thresholds based on project maturity:
   - New projects: Start with break: 60, work up to 90
   - Mature projects: Aim for break: 90+
   - Critical systems: Consider break: 95+

4. Add to package.json scripts:
   "test:mutation": "stryker run"

5. Integrate with quality pipeline:
   Add to turbo.json tasks and CI/CD workflows

6. Performance tuning:
   - Adjust coverageAnalysis based on project size
   - Use timeout settings for slow tests
   - Consider parallel execution for large codebases

COMMON PITFALLS TO AVOID:

❌ Don't exclude entire modules unless truly justified
❌ Don't set thresholds too low - mutation testing loses value
❌ Don't forget TypeScript ESM configuration
❌ Don't test configuration/bootstrap code - focus on business logic
❌ Don't write fake tests just to improve scores

✅ Do focus on business logic validation
✅ Do use property-based testing for edge cases
✅ Do document exclusion rationale
✅ Do start with lower thresholds and improve systematically
✅ Do integrate with CI/CD quality gates
*/
