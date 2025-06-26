import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import security from 'eslint-plugin-security';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import nodePlugin from 'eslint-plugin-n'; // Modern Node.js plugin compatible with ESLint v9
import vitestPlugin from 'eslint-plugin-vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const aiPatterns = require('./eslint-plugin-ai-patterns.cjs');

export default [
  js.configs.recommended,

  // ESLint config file (ES modules)
  {
    files: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // ES modules
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      // Basic JS rules only - no TypeScript rules
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Script files (Node.js ES modules)
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Allow console in scripts
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // CommonJS config and tooling files
  {
    files: ['*.cjs', '**/.*.cjs', 'eslint-plugin-*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script', // CommonJS
      globals: {
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      // Basic JS rules only - no TypeScript rules
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // TypeScript source files (excluding tests and config files)
  {
    files: ['apps/*/src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Enable type-aware rules with specific project configuration
        project: ['./apps/*/tsconfig.json', './apps/*/test/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        require: 'readonly',
        NodeJS: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      security,
      'ai-patterns': aiPatterns,
      import: importPlugin,
      promise: promisePlugin,
      n: nodePlugin,
    },
    rules: {
      // TypeScript strict mode enforcement (non-type-aware rules only)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'off', // Let TypeScript handle this

      // Advanced TypeScript rules (now enabled with type-aware parsing)
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Security patterns
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',

      // Custom AI architectural patterns
      'ai-patterns/no-direct-env-access': 'error',
      'ai-patterns/fastify-error-handling': 'error',
      'ai-patterns/require-input-validation': 'error',
      'ai-patterns/service-dependency-injection': 'error',
      'ai-patterns/fastify-plugin-wrapper': 'error',

      // Import organization and circular dependency detection
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'import/no-unresolved': 'off', // TypeScript handles this better

      // Async/await best practices
      'no-async-promise-executor': 'error',
      'require-await': 'warn', // Warn instead of error for Fastify patterns
      'no-return-await': 'error',
      'promise/always-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',

      // Performance patterns
      'no-unreachable-loop': 'error',
      'no-constant-condition': 'error',
      'prefer-object-spread': 'error',
      'no-new-object': 'error',
      'no-array-constructor': 'error',

      // Node.js best practices (using eslint-plugin-n)
      'n/no-deprecated-api': 'error',
      'n/no-extraneous-import': 'error',
      'n/no-missing-import': 'off', // TypeScript handles this better
      'n/no-unpublished-import': 'off', // Allow dev dependencies in source
      'n/no-process-exit': 'off', // Allow process.exit in server startup
      'n/prefer-global/process': 'error',
      'n/prefer-global/console': 'error',

      // General code quality
      'no-console': 'off', // Allow console in server code
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // TypeScript source files in packages (excluding tests and config files)
  {
    files: ['packages/*/src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Enable type-aware rules with specific project configuration
        project: ['./packages/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        require: 'readonly',
        NodeJS: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      security,
      import: importPlugin,
      promise: promisePlugin,
      n: nodePlugin,
    },
    rules: {
      // TypeScript strict mode enforcement (non-type-aware rules only)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'off', // Let TypeScript handle this

      // Advanced TypeScript rules (now enabled with type-aware parsing)
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Security patterns
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',

      // Import organization and circular dependency detection
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-cycle': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // TypeScript handles this

      // Promise handling best practices
      'promise/always-return': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-callback-in-promise': 'error',

      // Performance patterns
      'no-unreachable-loop': 'error',
      'no-constant-condition': 'error',
      'prefer-object-spread': 'error',
      'no-new-object': 'error',
      'no-array-constructor': 'error',

      // Node.js best practices (using eslint-plugin-n)
      'n/no-deprecated-api': 'error',
      'n/no-extraneous-import': 'error',
      'n/no-missing-import': 'off', // TypeScript handles this better
      'n/no-unpublished-import': 'off', // Allow dev dependencies in source
      'n/no-process-exit': 'off', // Allow process.exit in server startup
      'n/prefer-global/process': 'error',
      'n/prefer-global/console': 'error',

      // General code quality
      'no-console': 'off', // Allow console in library code
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Allow type/value declaration merging (branded types pattern)
      'no-redeclare': 'off',
    },
  },

  // Test files with Vitest rules
  {
    files: [
      '**/*.test.ts',
      '**/*.test.js',
      '**/test/**/*.ts',
      '**/test/**/*.js',
      '**/*.spec.ts',
      '**/*.spec.js',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Disable type-aware rules for test files to avoid project configuration complexity
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      vitest: vitestPlugin,
    },
    rules: {
      // Vitest-specific test quality rules
      'vitest/expect-expect': 'error',
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-focused-tests': 'error',
      'vitest/valid-describe-callback': 'error',
      'vitest/valid-expect': 'error',
      'vitest/valid-title': 'error',
      'vitest/no-identical-title': 'error',
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-to-have-length': 'error',

      // Relax some rules for test files
      'ai-patterns/no-direct-env-access': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import/no-unresolved': 'off',
    },
  },
  // Configuration files (vitest.config.ts, etc.)
  {
    files: ['**/vitest.config.ts', '**/vite.config.ts', '**/*.config.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Disable type-aware rules for config files to avoid project dependency issues
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        require: 'readonly',
        NodeJS: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Basic TypeScript rules only for config files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
      'import/no-unresolved': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.turbo/**',
      'coverage/**',
      '**/*.d.ts',
      'apps/**/build/**',
      'packages/**/dist/**',
      'packages/**/build/**',
      '.stryker-tmp/**', // Ignore Stryker temporary files
      '**/.stryker-tmp/**', // Ignore all Stryker temp dirs
      'reports/**', // Ignore mutation test reports
    ],
  },
];
