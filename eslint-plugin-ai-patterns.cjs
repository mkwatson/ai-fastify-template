/* eslint-env node */
/**
 * ESLint Plugin for Runtime Safety Patterns
 * 
 * Minimal custom rules for patterns TypeScript cannot enforce at compile-time.
 * Focus: Environment validation and request validation only.
 */

module.exports = {
  rules: {
    // Rule 1: No direct process.env access (except in env validation files)
    'no-direct-env-access': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow direct process.env access outside of environment validation files',
          category: 'Security',
          recommended: true,
        },
        messages: {
          noDirectEnv: 'Direct process.env access found - use validated env schema instead',
        },
        schema: [],
      },
      create(context) {
        return {
          MemberExpression(node) {
            if (
              node.object.type === 'MemberExpression' &&
              node.object.object.name === 'process' &&
              node.object.property.name === 'env'
            ) {
              const filename = context.getFilename();

              // Allow in env validation files and tests
              if (
                filename.includes('env.ts') ||
                filename.includes('validate-env') ||
                filename.includes('test/') ||
                filename.includes('.test.') ||
                filename.includes('.spec.')
              ) {
                return;
              }

              context.report({
                node,
                messageId: 'noDirectEnv',
              });
            }
          },
        };
      },
    },

    // Rule 2: Require input validation in routes that use request.body
    'require-zod-validation': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require Zod schema validation for routes using request.body',
          category: 'Security',
          recommended: true,
        },
        messages: {
          missingValidation: 'Route uses request.body without Zod schema validation',
        },
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();

            if (!filename.includes('/routes/')) {
              return;
            }

            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText();

            if (
              text.includes('request.body') &&
              !text.includes('schema:') &&
              !text.includes('Schema')
            ) {
              context.report({
                node,
                messageId: 'missingValidation',
              });
            }
          },
        };
      },
    },
  },
};
