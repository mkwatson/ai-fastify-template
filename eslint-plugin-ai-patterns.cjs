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
          description:
            'Disallow direct process.env access outside of environment validation files',
          category: 'Security',
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

    // Rule 2: Require input validation in routes that use request.body
    'require-zod-validation': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Require Zod schema validation for routes using request.body',
          category: 'Security',
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

    // Rule 3: Require property tests for business logic functions
    'require-property-tests': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Require property-based tests for all business logic functions',
          category: 'Testing',
          recommended: true,
        },
        messages: {
          missingPropertyTests:
            'Business logic function "{{functionName}}" requires property-based tests - add tests with fast-check invariants',
          missingPropertyTestsFile:
            'Business logic functions found but no corresponding property tests file exists',
        },
        schema: [],
      },
      create(context) {
        return {
          Program(node) {
            const filename = context.getFilename();
            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText();

            // Only check business logic files (utils, services, calculations, validators)
            if (
              !filename.includes('/utils/') &&
              !filename.includes('/services/') &&
              !filename.includes('/lib/') &&
              !filename.includes('calculations') &&
              !filename.includes('validators')
            ) {
              return;
            }

            // Skip test files
            if (
              filename.includes('.test.') ||
              filename.includes('.spec.') ||
              filename.includes('/test/')
            ) {
              return;
            }

            // Find exported functions
            const exportedFunctions = [];
            
            // Match function declarations: export function name()
            const functionDeclarations = text.matchAll(
              /export\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g
            );
            for (const match of functionDeclarations) {
              exportedFunctions.push(match[1]);
            }

            // Match arrow function exports: export const name = () =>
            const arrowFunctions = text.matchAll(
              /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>/g
            );
            for (const match of arrowFunctions) {
              exportedFunctions.push(match[1]);
            }

            if (exportedFunctions.length === 0) {
              return;
            }

            // Check if corresponding test file exists
            const testFilePaths = [
              filename.replace('/src/', '/test/').replace('.ts', '.test.ts'),
              filename.replace('/src/', '/test/').replace('.ts', '.spec.ts'),
              filename.replace('.ts', '.test.ts'),
              filename.replace('.ts', '.spec.ts'),
            ];

            const fs = require('fs');
            let testFileExists = false;
            let testFileContent = '';

            for (const testPath of testFilePaths) {
              try {
                if (fs.existsSync(testPath)) {
                  testFileExists = true;
                  testFileContent = fs.readFileSync(testPath, 'utf8');
                  break;
                }
              } catch {
                // File doesn't exist, continue
              }
            }

            if (!testFileExists) {
              context.report({
                node,
                messageId: 'missingPropertyTestsFile',
              });
              return;
            }

            // Check each function for property tests
            for (const functionName of exportedFunctions) {
              // Look for property tests with this function name
              const hasPropertyTests = 
                testFileContent.includes('fc.assert') &&
                testFileContent.includes('fc.property') &&
                testFileContent.includes(functionName);

              if (!hasPropertyTests) {
                // Find the actual function node for better error reporting
                const functionPattern = new RegExp(
                  `export\\s+(?:function\\s+${functionName}|const\\s+${functionName}\\s*=)`,
                  'g'
                );
                const match = functionPattern.exec(text);
                
                if (match) {
                  const lines = text.substring(0, match.index).split('\n');
                  const line = lines.length;
                  const column = lines[lines.length - 1].length;
                  
                  context.report({
                    node,
                    loc: { line, column },
                    messageId: 'missingPropertyTests',
                    data: { functionName },
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};
