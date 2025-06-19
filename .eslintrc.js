/* eslint-env node */
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    commonjs: true,
  },
  // Default parser for JS files
  parser: 'espree',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
  },
  plugins: [
    '@typescript-eslint',
    'security',
    'ai-patterns'
  ],
  extends: [
    'eslint:recommended',
    'plugin:security/recommended'
  ],
  rules: {
    // Basic rules for JS files
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
    
    // Security patterns
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.turbo/',
    'coverage/',
    '*.d.ts',
    '.eslintrc.js',
    'eslint-plugin-ai-patterns.js'
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
      },
      extends: [
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-requiring-type-checking'
      ],
      rules: {
        // TypeScript strict mode enforcement
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        
        // Custom AI architectural patterns for TS files
        'ai-patterns/no-direct-env-access': 'error',
        'ai-patterns/fastify-error-handling': 'error',
        'ai-patterns/require-input-validation': 'error',
        'ai-patterns/service-dependency-injection': 'error',
        'ai-patterns/fastify-plugin-wrapper': 'error'
      }
    },
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/test/**'],
      rules: {
        'ai-patterns/no-direct-env-access': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ]
};