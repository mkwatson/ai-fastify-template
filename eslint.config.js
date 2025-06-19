import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import node from "eslint-plugin-node";
import security from "eslint-plugin-security";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        process: "readonly",
        console: "readonly",
        require: "readonly",
        NodeJS: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        global: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      security,
      node,
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "warn", // Allow unused vars for now
      "@typescript-eslint/explicit-function-return-type": "warn",

      // Security rules (relaxed for development)
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-eval-with-expression": "error",

      // Node.js specific rules
      "node/no-missing-import": "off", // Handled by TypeScript
      "node/no-unpublished-import": "off", // Monorepo imports
      "node/no-unsupported-features/es-syntax": "off", // Using modern ES features

      // General code quality (relaxed for existing code)
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-vars": "warn", // Allow unused vars for now
    },
  },
  {
    files: [
      "**/*.test.ts",
      "**/*.test.js",
      "**/test/**/*.ts",
      "**/test/**/*.js",
    ],
    rules: {
      // Relax some rules for test files
      "no-console": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".turbo/**",
      "coverage/**",
      "**/*.d.ts",
      "apps/**/build/**",
      "packages/**/dist/**",
    ],
  },
];
