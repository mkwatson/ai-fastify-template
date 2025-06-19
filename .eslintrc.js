/* eslint-env node */
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    commonjs: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
  },
  plugins: [
    '@typescript-eslint',
    'security',
    'ai-patterns'
  ],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:security/recommended'
  ],
  rules: {
    // TypeScript strict mode enforcement
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    
    // Security patterns
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    
    // Custom AI architectural patterns
    'ai-patterns/no-direct-env-access': 'error',
    'ai-patterns/fastify-error-handling': 'error',
    'ai-patterns/require-input-validation': 'error',
    'ai-patterns/service-dependency-injection': 'error',
    'ai-patterns/fastify-plugin-wrapper': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.turbo/',
    'coverage/',
    '*.d.ts'
  ],
  overrides: [
    {
      // CommonJS config and tooling files
      files: [
        "*.js", "*.cjs",                        // root-level JS/CJS files
        "**/*.js", "**/*.cjs",                  // any JS in subfolders
        ".*.js", "**/.*.js",                    // include dotfiles like .eslintrc.js
      ],
      excludedFiles: ["**/*.ts", "**/*.tsx"],
      
      // Use default ESLint parser for CommonJS
      parser: "espree",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "script"      // CommonJS script mode
      },
      
      // Enable Node environment
      env: {
        node: true,
        commonjs: true,
        es2021: true
      },
      
      // Disable TypeScript rules for JS files
      extends: [],  // Don't inherit TypeScript extends
      plugins: [],  // No TypeScript plugin
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-function-return-type": "off", 
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/prefer-optional-chain": "off",
        "ai-patterns/no-direct-env-access": "off",
        "ai-patterns/fastify-error-handling": "off",
        "ai-patterns/require-input-validation": "off",
        "ai-patterns/service-dependency-injection": "off",
        "ai-patterns/fastify-plugin-wrapper": "off",
        "no-undef": "off"  // Node env covers this
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