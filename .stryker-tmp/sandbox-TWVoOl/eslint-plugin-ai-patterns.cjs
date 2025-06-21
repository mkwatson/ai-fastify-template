/* eslint-env node */
// @ts-nocheck

/**
 * ESLint Plugin for AI Fastify Template Architectural Patterns
 *
 * Custom rules to enforce project-specific architectural constraints
 * that ensure code quality and maintainability for AI development.
 */

module.exports = {
  rules: {
    // Rule 1: No direct process.env access (except in env validation files)
    'no-direct-env-access': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Disallow direct process.env access outside of environment validation files',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          noDirectEnv:
            'Direct process.env access found - use validated env schema instead',
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

    // Rule 2: Fastify error handling patterns in routes
    'fastify-error-handling': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce Fastify error handling patterns in routes',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          genericError:
            'Generic Error throwing in routes - use Fastify error handling patterns (fastify.httpErrors)',
        },
        schema: [],
      },
      create(context) {
        return {
          ThrowStatement(node) {
            const filename = context.getFilename();

            if (
              filename.includes('/routes/') &&
              node.argument.type === 'NewExpression' &&
              node.argument.callee.name === 'Error'
            ) {
              context.report({
                node,
                messageId: 'genericError',
              });
            }
          },
        };
      },
    },

    // Rule 3: Require input validation in routes that use request.body
    'require-input-validation': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Require Zod schema validation for routes using request.body',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          missingValidation:
            'Route uses request.body without Zod schema validation',
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

    // Rule 4: Service layer dependency injection patterns
    'service-dependency-injection': {
      meta: {
        type: 'suggestion',
        docs: {
          description:
            'Enforce dependency injection via constructor in service classes',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          missingDI:
            'Service class should use dependency injection via constructor',
        },
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();

            if (!filename.includes('/services/')) {
              return;
            }

            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText();

            if (
              text.includes('new ') &&
              text.includes('class ') &&
              !text.includes('constructor(')
            ) {
              context.report({
                node,
                messageId: 'missingDI',
              });
            }
          },
        };
      },
    },

    // Rule 5: Fastify plugin registration patterns
    'fastify-plugin-wrapper': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require fastify-plugin wrapper for Fastify plugins',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          missingWrapper: 'Fastify plugins should use fastify-plugin wrapper',
        },
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();

            if (!filename.includes('/plugins/')) {
              return;
            }

            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText();

            if (
              text.includes('export default') &&
              !text.includes('fastify-plugin')
            ) {
              context.report({
                node,
                messageId: 'missingWrapper',
              });
            }
          },
        };
      },
    },
  },
};
