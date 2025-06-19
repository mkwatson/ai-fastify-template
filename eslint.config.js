import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import security from 'eslint-plugin-security';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
// import nodePlugin from 'eslint-plugin-node'; // Incompatible with ESLint v9
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

  // TypeScript source files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Remove project for simpler setup - disables type-aware rules but avoids tsconfig issues
        // project: ["./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
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
      // Note: prefer-nullish-coalescing and prefer-optional-chain require type info, disabled for simplicity

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
      'require-await': 'off', // Allow async functions without await (common in Fastify plugins)
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

      // Node.js best practices (manual rules since eslint-plugin-node incompatible with ESLint v9)
      'no-process-exit': 'error',
      'no-path-concat': 'off', // Custom rule would be needed

      // General code quality
      'no-console': 'off', // Allow console in server code
      'prefer-const': 'error',
      'no-var': 'error',
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
    ],
  },
];
