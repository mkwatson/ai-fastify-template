# Mutation Testing Guide for AI Fastify Template

## Overview

This guide documents proven patterns for implementing mutation testing with Stryker in our TypeScript/Fastify/Vitest monorepo environment. Use this as a reference for future testing implementations.

## Why Mutation Testing Matters

Mutation testing is especially critical for AI-generated code because:

- **Catches subtle logic errors** that basic coverage misses
- **Validates test quality** rather than just test quantity
- **Prevents "coverage theater"** where tests exist but don't validate logic
- **Ensures business logic robustness** against edge cases

## Core Implementation Patterns

### 1. Dual Test Strategy

**Pattern: Separate Unit and Integration Tests for Maximum Coverage**

```
├── test/
│   ├── routes/
│   │   ├── example.test.ts        # Integration tests (full app)
│   │   └── example.unit.test.ts   # Unit tests (direct imports)
│   ├── plugins/
│   │   ├── env.test.ts            # Schema validation (unit)
│   │   └── env.direct.test.ts     # Plugin integration
│   └── utils/
│       └── calculations.test.ts   # Pure logic tests
```

**Why Both Are Needed:**

- **Unit tests**: Direct imports required for Stryker instrumentation
- **Integration tests**: Real-world usage patterns and plugin interactions
- **Combined**: Achieves 95%+ mutation scores with confidence

### 2. Strategic Configuration

**File: `stryker.config.mjs`**

```javascript
export default {
  packageManager: 'pnpm',
  plugins: [
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
  ],
  testRunner: 'vitest',
  testRunnerNodeArgs: ['--import', 'tsx/esm'], // Critical for TypeScript
  coverageAnalysis: 'perTest',

  // Smart targeting - focus on business logic
  mutate: [
    'apps/backend-api/src/**/*.ts',
    '!apps/backend-api/src/**/*.{test,spec}.ts',
    '!apps/backend-api/src/**/*.d.ts',
    '!apps/backend-api/src/server.ts', // Bootstrap excluded
    '!apps/backend-api/src/app.ts', // App setup excluded
    '!apps/backend-api/src/plugins/env.ts:84-106', // Error formatting excluded
  ],

  // Enterprise-grade thresholds
  thresholds: {
    high: 90, // High quality threshold
    low: 80, // Coverage threshold
    break: 90, // Build fails below this
  },

  // Performance optimizations
  ignoreStatic: true,
  tempDirName: '.stryker-tmp',
  cleanTempDir: true,
};
```

### 3. Test Quality Patterns

**✅ Good: Logic Validation**

```typescript
// Tests actual business logic
it('should calculate 10% discount correctly', () => {
  expect(calculateDiscount(100, 0.1)).toBe(90);
});

it('should handle edge case: zero discount', () => {
  expect(calculateDiscount(100, 0)).toBe(100);
});

it('should throw error for negative amounts', () => {
  expect(() => calculateDiscount(-100, 0.1)).toThrow('Amount must be positive');
});
```

**❌ Bad: Coverage Theater**

```typescript
// Tests framework, not logic
it('should return a number', () => {
  const result = calculateDiscount(100, 0.1);
  expect(typeof result).toBe('number');
});

// Fake test for unreachable code
it('should handle unknown errors', () => {
  const fakeResult = { error: 'Unknown error' };
  expect(fakeResult.error).toBe('Unknown error');
});
```

### 4. Property-Based Testing Integration

**Pattern: Use fast-check for Comprehensive Edge Cases**

```typescript
import fc from 'fast-check';

describe('calculateTotal - Property-Based Tests', () => {
  it('should never return negative totals', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            price: fc.float({ min: 0, max: 1000 }),
            quantity: fc.integer({ min: 0, max: 100 }),
          })
        ),
        items => {
          const result = calculateTotal(items);
          return result >= 0;
        }
      )
    );
  });

  it('should be commutative', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            price: fc.float({ min: 0, max: 100 }),
            quantity: fc.integer({ min: 0, max: 10 }),
          })
        ),
        items => {
          const shuffled = [...items].sort(() => Math.random() - 0.5);
          return calculateTotal(items) === calculateTotal(shuffled);
        }
      )
    );
  });
});
```

## Common Configuration Issues

### TypeScript/ESM Integration

**Problem:** Stryker fails to run tests with TypeScript imports
**Solution:** Configure `testRunnerNodeArgs: ['--import', 'tsx/esm']`

### Workspace Dependencies

**Problem:** Monorepo dependencies not resolved
**Solution:** Install required packages at workspace root:

```bash
pnpm add -Dw vitest tsx @stryker-mutator/vitest-runner
```

### Threshold Tuning

**Problem:** Low mutation scores due to weak tests
**Solution:** Start with lower thresholds, improve systematically:

```javascript
// Phase 1: Get it working
thresholds: { break: 60 }

// Phase 2: Improve tests
thresholds: { break: 80 }

// Phase 3: Enterprise quality
thresholds: { break: 90 }
```

## Integration with Quality Pipeline

### TurboRepo Integration

**File: `turbo.json`**

```json
{
  "tasks": {
    "test:mutation": {
      "dependsOn": ["test"],
      "outputs": ["reports/mutation/**"],
      "cache": true
    }
  }
}
```

### CI/CD Integration

**Package Scripts:**

```json
{
  "scripts": {
    "test:mutation": "stryker run",
    "ai:compliance": "turbo lint type-check test test:mutation build"
  }
}
```

## Troubleshooting Guide

### Low Mutation Scores

1. **Check for fake tests** - Remove tests that don't validate logic
2. **Add edge case tests** - Focus on boundary conditions
3. **Use property-based testing** - Generate comprehensive test cases
4. **Review exclusions** - Only exclude low-value code paths

### Performance Issues

1. **Optimize mutate patterns** - Exclude bootstrap and configuration files
2. **Use `ignoreStatic: true`** - Skip static mutants
3. **Parallel execution** - Configure based on CPU cores
4. **Strategic exclusions** - Document rationale for each exclusion

### Configuration Failures

1. **Check TypeScript setup** - Ensure tsx/esm integration
2. **Verify dependencies** - Install at correct workspace level
3. **Test isolation** - Ensure tests can run independently
4. **Review file patterns** - Check glob patterns match target files

## Success Metrics

**Target Metrics:**

- Mutation Score: ≥90%
- Execution Time: <30 seconds
- Routes Coverage: 100%
- Utils Coverage: ≥90%

**Quality Indicators:**

- ✅ Tests fail when business logic is broken
- ✅ Property-based tests catch edge cases
- ✅ Strategic exclusions are documented
- ✅ CI pipeline enforces thresholds

## Example Implementation Timeline

**Week 1: Foundation**

- Install Stryker and configure basic setup
- Achieve 60% mutation score with existing tests
- Identify coverage gaps

**Week 2: Quality Improvement**

- Add property-based tests for critical functions
- Implement dual test strategy (unit + integration)
- Reach 80% mutation score

**Week 3: Enterprise Polish**

- Strategic exclusions with documentation
- CI/CD integration and quality gates
- Achieve 90%+ mutation score

## References

- [Stryker Mutator Documentation](https://stryker-mutator.io/docs/)
- [fast-check Property Testing](https://fast-check.dev/)
- [Project Testing Guidelines](./AGENTS.md#testing--validation-standards)

---

_This guide is based on the successful implementation in MAR-17, which achieved 95.45% mutation score._
