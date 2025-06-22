#!/usr/bin/env node

/**
 * Test script for dependency-cruiser architectural rules
 * Creates temporary test files that violate rules and verifies they're caught
 */

/* eslint-env node */
/* eslint no-console: "off" */

import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';

const TEST_DIR = 'temp-test-violations';
const APPS_TEST_DIR = join(TEST_DIR, 'apps', 'test-app', 'src');

/**
 * Test violations for architectural rules
 */
const testCases = [
  {
    name: 'no-routes-to-routes',
    description: 'Routes should not import from other routes',
    files: [
      {
        path: join(APPS_TEST_DIR, 'routes', 'users.ts'),
        content: `import { something } from './posts.js';\nexport default 'users';`,
      },
      {
        path: join(APPS_TEST_DIR, 'routes', 'posts.ts'),
        content: `export const something = 'posts';`,
      },
    ],
    expectedViolation: 'no-routes-to-routes',
  },
  {
    name: 'no-services-to-routes',
    description: 'Services should not import from routes',
    files: [
      {
        path: join(APPS_TEST_DIR, 'services', 'user-service.ts'),
        content: `import { userRoute } from '../routes/users.js';\nexport class UserService {}`,
      },
      {
        path: join(APPS_TEST_DIR, 'routes', 'users.ts'),
        content: `export const userRoute = 'users';`,
      },
    ],
    expectedViolation: 'no-services-to-routes',
  },
  {
    name: 'no-plugins-to-routes',
    description: 'Plugins should not import from routes',
    files: [
      {
        path: join(APPS_TEST_DIR, 'plugins', 'auth.ts'),
        content: `import { userRoute } from '../routes/users.js';\nexport default 'auth';`,
      },
      {
        path: join(APPS_TEST_DIR, 'routes', 'users.ts'),
        content: `export const userRoute = 'users';`,
      },
    ],
    expectedViolation: 'no-plugins-to-routes',
  },
  {
    name: 'no-utils-to-business-logic',
    description: 'Utils should not import from services, routes, or plugins',
    files: [
      {
        path: join(APPS_TEST_DIR, 'utils', 'helper.ts'),
        content: `import { UserService } from '../services/user-service.js';\nexport const helper = 'helper';`,
      },
      {
        path: join(APPS_TEST_DIR, 'services', 'user-service.ts'),
        content: `export class UserService {}`,
      },
    ],
    expectedViolation: 'no-utils-to-business-logic',
  },
];

/**
 * Create test directories and files
 */
function setupTestFiles(testCase) {
  // Create all necessary directories
  const directories = new Set();
  testCase.files.forEach(file => {
    const dir = file.path.split('/').slice(0, -1).join('/');
    directories.add(dir);
  });

  directories.forEach(dir => {
    mkdirSync(dir, { recursive: true });
  });

  // Create test files
  testCase.files.forEach(file => {
    writeFileSync(file.path, file.content);
  });
}

/**
 * Run dependency-cruiser and check for violations
 */
function runDependencyCheck(testDir) {
  try {
    execSync(
      `npx depcruise ${testDir} --config .dependency-cruiser.js --validate`,
      {
        stdio: 'pipe',
      }
    );
    return { success: true, violations: [] };
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const violations = output
      .split('\n')
      .filter(line => line.includes('error') || line.includes('warn'))
      .map(line => line.trim());
    return { success: false, violations, output };
  }
}

/**
 * Clean up test files
 */
function cleanup() {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

/**
 * Run all tests
 */
function runTests() {
  console.log('🧪 Testing dependency-cruiser architectural rules...\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);

    try {
      // Setup test files
      setupTestFiles(testCase);

      // Run dependency check
      const result = runDependencyCheck(
        join(TEST_DIR, 'apps', 'test-app', 'src')
      );

      // Check if expected violation was found
      const foundExpectedViolation = result.violations.some(violation =>
        violation.includes(testCase.expectedViolation)
      );

      if (!result.success && foundExpectedViolation) {
        console.log(
          `✅ PASS - Correctly detected violation: ${testCase.expectedViolation}\n`
        );
        passed++;
      } else if (result.success) {
        console.log(
          `❌ FAIL - Expected violation not detected: ${testCase.expectedViolation}`
        );
        console.log(
          `No violations found when ${testCase.expectedViolation} should have been caught\n`
        );
        failed++;
      } else {
        console.log(`❌ FAIL - Unexpected violations:`, result.violations);
        console.log(`Expected: ${testCase.expectedViolation}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAIL - Error running test: ${error.message}\n`);
      failed++;
    }

    // Cleanup after each test
    cleanup();
  }

  // Test that clean code passes
  console.log('Testing: clean-code-passes');
  console.log('Description: Clean architecture should pass validation');

  try {
    const result = runDependencyCheck('apps/backend-api/src');
    if (result.success) {
      console.log('✅ PASS - Clean code passes validation\n');
      passed++;
    } else {
      console.log(
        '❌ FAIL - Clean code should not have violations:',
        result.violations
      );
      console.log('Output:', result.output, '\n');
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL - Error testing clean code: ${error.message}\n`);
    failed++;
  }

  // Summary
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${passed + failed}`);

  if (failed > 0) {
    console.log(
      '\n🚨 Some tests failed. Please review the dependency-cruiser configuration.'
    );
    process.exit(1);
  } else {
    console.log(
      '\n🎉 All tests passed! Dependency rules are working correctly.'
    );
  }
}

// Handle cleanup on process exit
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit();
});
process.on('SIGTERM', () => {
  cleanup();
  process.exit();
});

// Run tests
runTests();
