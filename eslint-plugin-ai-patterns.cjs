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

    // Rule 6: Mandatory property-based testing for business logic functions
    'require-property-tests': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Require property-based tests for all business logic functions',
          category: 'Quality',
          recommended: true,
        },
        messages: {
          missingPropertyTests:
            'Business logic function "{{functionName}}" requires property-based tests using fast-check. Create tests that verify mathematical properties and invariants.',
          noPropertyTestFile:
            'Business logic in utils/ requires corresponding property-based tests. Create a test file with fc.assert() and fc.property() for functions: {{functions}}',
        },
        schema: [
          {
            type: 'object',
            properties: {
              excludePatterns: {
                type: 'array',
                items: { type: 'string' },
                description:
                  'Patterns to exclude from property testing requirements',
              },
              requireTestFile: {
                type: 'boolean',
                description: 'Whether to require test files for utils modules',
                default: true,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const options = context.options[0] || {};
        const excludePatterns = options.excludePatterns || [];
        const requireTestFile = options.requireTestFile !== false;

        // Helper to check if function should be excluded
        function isExcluded(functionName, filename) {
          const fullPath = `${filename}:${functionName}`;
          return excludePatterns.some(pattern => {
            const regex = new RegExp(pattern);
            return regex.test(fullPath) || regex.test(functionName);
          });
        }

        // Helper to find exported functions
        function getExportedFunctions() {
          const sourceCode = context.getSourceCode();
          const text = sourceCode.getText();
          const functions = [];

          // Find export function declarations
          const exportFunctionRegex = /export\s+function\s+(\w+)/g;
          let match;
          while ((match = exportFunctionRegex.exec(text)) !== null) {
            functions.push(match[1]);
          }

          // Find export const functions (arrow functions)
          const exportConstRegex =
            /export\s+const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g;
          while ((match = exportConstRegex.exec(text)) !== null) {
            functions.push(match[1]);
          }

          return functions;
        }

        // Helper to check if test file exists and has property tests
        function hasPropertyTests(utilsFilename, functions) {
          const fs = require('fs');

          try {
            // Convert utils file path to test file path
            const basePath = utilsFilename.replace(/\/src\//, '/test/');
            const testFilePath = basePath.replace(/\.ts$/, '.test.ts');

            if (!fs.existsSync(testFilePath)) {
              return { exists: false, hasPropertyTests: false };
            }

            const testContent = fs.readFileSync(testFilePath, 'utf8');

            // Check for fast-check usage
            const hasFastCheck =
              testContent.includes('fc.assert') &&
              testContent.includes('fc.property');

            if (!hasFastCheck) {
              return {
                exists: true,
                hasPropertyTests: false,
                missingPropertyTests: functions,
              };
            }

            // Check if all functions have property tests
            // Look for broader patterns that indicate property testing for each function
            const missingPropertyTests = functions.filter(func => {
              // More flexible patterns to detect property tests for a function
              const patterns = [
                // Direct function name in describe/it with "property" or "invariant"
                new RegExp(
                  `describe\\([^)]*${func}[^)]*property|describe\\([^)]*property[^)]*${func}`,
                  'i'
                ),
                new RegExp(
                  `describe\\([^)]*${func}[^)]*invariant|describe\\([^)]*invariant[^)]*${func}`,
                  'i'
                ),
                // Function name in property test sections
                new RegExp(
                  `Property-based[^}]*${func}|${func}[^}]*Property-based`,
                  'i'
                ),
                // Function name near fc.assert/fc.property (much broader search)
                new RegExp(
                  `fc\\.assert[\\s\\S]*?${func}[\\s\\S]*?\\}\\s*\\)\\s*;|${func}[\\s\\S]*?fc\\.assert`,
                  'g'
                ),
                // Pattern for test sections with function names and property-based
                new RegExp(
                  `${func}[\\s\\S]*?property.*?fc\\.assert|property.*?${func}[\\s\\S]*?fc\\.assert`,
                  'gi'
                ),
                // Broader pattern for describe blocks containing the function name and property tests
                new RegExp(
                  `describe\\([^}]*${func}[^}]*\\{[\\s\\S]*?property[\\s\\S]*?fc\\.assert`,
                  'gi'
                ),
                // Pattern for describe blocks with Property-based in title that contain the function
                new RegExp(
                  `describe\\([^}]*Property-based[^}]*\\{[\\s\\S]*?${func}`,
                  'gi'
                ),
              ];

              return !patterns.some(pattern => pattern.test(testContent));
            });

            return {
              exists: true,
              hasPropertyTests: hasFastCheck,
              missingPropertyTests,
            };
          } catch {
            return { exists: false, hasPropertyTests: false };
          }
        }

        return {
          Program(node) {
            const filename = context.getFilename();

            // Only check files in utils/ directory
            if (
              !filename.includes('/utils/') ||
              filename.includes('.test.') ||
              filename.includes('.spec.')
            ) {
              return;
            }

            const functions = getExportedFunctions();

            if (functions.length === 0) {
              return;
            }

            // Filter out excluded functions
            const functionsToTest = functions.filter(
              func => !isExcluded(func, filename)
            );

            if (functionsToTest.length === 0) {
              return;
            }

            if (requireTestFile) {
              const testInfo = hasPropertyTests(filename, functionsToTest);

              if (!testInfo.exists) {
                context.report({
                  node,
                  messageId: 'noPropertyTestFile',
                  data: { functions: functionsToTest.join(', ') },
                });
                return;
              }

              if (!testInfo.hasPropertyTests) {
                context.report({
                  node,
                  messageId: 'noPropertyTestFile',
                  data: { functions: functionsToTest.join(', ') },
                });
                return;
              }

              // Report specific functions missing property tests
              if (
                testInfo.missingPropertyTests &&
                testInfo.missingPropertyTests.length > 0
              ) {
                testInfo.missingPropertyTests.forEach(func => {
                  context.report({
                    node,
                    messageId: 'missingPropertyTests',
                    data: { functionName: func },
                  });
                });
              }
            }
          },
        };
      },
    },
  },
};
