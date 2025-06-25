/* eslint-env node */
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

    // Rule 6: Enforce Result types for async service operations
    'require-result-type': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require Result<T, E> return types for async service operations',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          missingResultType:
            'Async service methods must return Result<T, E> or AsyncResult<T, E> for explicit error handling',
          avoidThrowInService:
            'Service methods should return Result errors instead of throwing - use err() from result utils',
        },
        schema: [
          {
            type: 'object',
            properties: {
              enforceInServices: {
                type: 'boolean',
                default: true,
              },
              enforceInUtils: {
                type: 'boolean',
                default: true,
              },
              allowThrowInTests: {
                type: 'boolean',
                default: true,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const options = context.options[0] || {};
        const enforceInServices = options.enforceInServices !== false;
        const enforceInUtils = options.enforceInUtils !== false;
        const allowThrowInTests = options.allowThrowInTests !== false;

        function isServiceFile(filename) {
          return filename.includes('/services/') || filename.includes('/utils/');
        }

        function isTestFile(filename) {
          return (
            filename.includes('/test/') ||
            filename.includes('.test.') ||
            filename.includes('.spec.')
          );
        }

        function isExampleFile(filename) {
          return filename.includes('-example.') || filename.includes('.example.');
        }

        function hasResultReturnType(node) {
          if (!node.returnType) return false;

          const returnTypeText = context.getSourceCode().getText(node.returnType);
          return (
            returnTypeText.includes('Result<') ||
            returnTypeText.includes('AsyncResult<') ||
            returnTypeText.includes('ServiceResult<') ||
            returnTypeText.includes('AsyncServiceResult<') ||
            returnTypeText.includes('Promise<Result<')
          );
        }

        function isAsyncFunction(node) {
          return node.async === true;
        }

        function isServiceMethod(node) {
          // Check if it's a method in a service class
          if (node.parent && node.parent.type === 'MethodDefinition') {
            const classNode = node.parent.parent.parent;
            if (classNode && classNode.type === 'ClassDeclaration') {
              const className = classNode.id?.name || '';
              return className.includes('Service');
            }
          }

          // Check if it's an exported function in services/utils
          if (node.parent && node.parent.type === 'VariableDeclarator') {
            const exportNode = node.parent.parent.parent;
            if (exportNode && exportNode.type === 'ExportNamedDeclaration') {
              return true;
            }
          }

          // Check if it's a direct export function
          if (
            node.parent &&
            (node.parent.type === 'ExportDefaultDeclaration' ||
              node.parent.type === 'ExportNamedDeclaration')
          ) {
            return true;
          }

          return false;
        }

        return {
          // Check async function declarations and expressions
          FunctionDeclaration(node) {
            const filename = context.getFilename();

            // Skip test files if allowed
            if (allowThrowInTests && isTestFile(filename)) {
              return;
            }

            // Skip example files (they're for demonstration)
            if (isExampleFile(filename)) {
              return;
            }

            // Only check service files
            if (!isServiceFile(filename)) {
              return;
            }

            // Only check async functions that look like service methods
            if (!isAsyncFunction(node) || !isServiceMethod(node)) {
              return;
            }

            // Check for Result return type
            if (!hasResultReturnType(node)) {
              context.report({
                node: node.id || node,
                messageId: 'missingResultType',
              });
            }
          },

          // Check async arrow functions
          ArrowFunctionExpression(node) {
            const filename = context.getFilename();

            if (allowThrowInTests && isTestFile(filename)) {
              return;
            }

            if (isExampleFile(filename)) {
              return;
            }

            if (!isServiceFile(filename)) {
              return;
            }

            if (!isAsyncFunction(node) || !isServiceMethod(node)) {
              return;
            }

            if (!hasResultReturnType(node)) {
              context.report({
                node,
                messageId: 'missingResultType',
              });
            }
          },

          // Check method definitions in classes
          MethodDefinition(node) {
            const filename = context.getFilename();

            if (allowThrowInTests && isTestFile(filename)) {
              return;
            }

            if (isExampleFile(filename)) {
              return;
            }

            if (!isServiceFile(filename)) {
              return;
            }

            // Check if it's in a service class
            const classNode = node.parent.parent;
            if (!classNode || classNode.type !== 'ClassDeclaration') {
              return;
            }

            const className = classNode.id?.name || '';
            if (!className.includes('Service')) {
              return;
            }

            // Check async methods
            if (!node.value || !isAsyncFunction(node.value)) {
              return;
            }

            // Skip constructor and private methods
            if (
              node.kind === 'constructor' ||
              (node.key && node.key.name && node.key.name.startsWith('_'))
            ) {
              return;
            }

            if (!hasResultReturnType(node.value)) {
              context.report({
                node: node.key || node,
                messageId: 'missingResultType',
              });
            }
          },

          // Check for throw statements in service files
          ThrowStatement(node) {
            const filename = context.getFilename();

            if (allowThrowInTests && isTestFile(filename)) {
              return;
            }

            if (isExampleFile(filename)) {
              return;
            }

            // Only check service files
            if (!isServiceFile(filename)) {
              return;
            }

            // Allow throws in validation/setup code, but warn in service methods
            const functionNode = node.parent;
            let currentNode = functionNode;
            
            // Walk up to find if we're in a service method
            while (currentNode && currentNode.type !== 'Program') {
              if (
                (currentNode.type === 'FunctionDeclaration' ||
                  currentNode.type === 'FunctionExpression' ||
                  currentNode.type === 'ArrowFunctionExpression') &&
                isAsyncFunction(currentNode)
              ) {
                // We're in an async function that might be a service method
                context.report({
                  node,
                  messageId: 'avoidThrowInService',
                });
                break;
              }
              currentNode = currentNode.parent;
            }
          },
        };
      },
    },
  },
};
