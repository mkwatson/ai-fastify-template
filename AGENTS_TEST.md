# AI Agent Testing Guidelines

> Companion to AGENTS.md - Specific guidance for writing high-quality tests when using AI coding agents

## 🎯 Core Testing Principles for AI Agents

### 1. **Test Behavior, Not Implementation**

AI agents often test implementation details that make tests brittle:

```typescript
// ❌ BAD: Testing implementation
it('should call database.find with correct params', () => {
  const spy = jest.spyOn(database, 'find');
  userService.getUser('123');
  expect(spy).toHaveBeenCalledWith({ id: '123' });
});

// ✅ GOOD: Testing behavior
it('should return user with matching ID', async () => {
  const user = await userService.getUser('123');
  expect(user).toMatchObject({ id: '123', email: 'test@example.com' });
});
```

### 2. **Edge Cases Are MANDATORY**

AI agents have a strong happy-path bias. Every function MUST test:

```typescript
describe('calculateDiscount', () => {
  // Happy path
  it('should apply 10% discount for amounts over $100', () => {
    expect(calculateDiscount(150)).toBe(15);
  });

  // REQUIRED edge cases
  it('should return 0 for null input', () => {
    expect(calculateDiscount(null)).toBe(0);
  });

  it('should return 0 for undefined input', () => {
    expect(calculateDiscount(undefined)).toBe(0);
  });

  it('should handle negative amounts', () => {
    expect(calculateDiscount(-100)).toBe(0);
  });

  it('should handle zero amount', () => {
    expect(calculateDiscount(0)).toBe(0);
  });

  it('should handle maximum safe integer', () => {
    expect(calculateDiscount(Number.MAX_SAFE_INTEGER)).toBeLessThan(
      Number.MAX_SAFE_INTEGER
    );
  });
});
```

### 3. **Integration Tests Must Test Workflows**

```typescript
// ❌ BAD: Just testing status codes
it('should return 200', async () => {
  const response = await app.inject({ method: 'GET', url: '/users' });
  expect(response.statusCode).toBe(200);
});

// ✅ GOOD: Testing complete workflow
it('should create and retrieve user', async () => {
  // Create user
  const createResponse = await app.inject({
    method: 'POST',
    url: '/users',
    payload: { email: 'test@example.com', name: 'Test User' },
  });

  expect(createResponse.statusCode).toBe(201);
  const { id } = JSON.parse(createResponse.payload);

  // Retrieve created user
  const getResponse = await app.inject({
    method: 'GET',
    url: `/users/${id}`,
  });

  expect(getResponse.statusCode).toBe(200);
  const user = JSON.parse(getResponse.payload);
  expect(user).toMatchObject({
    id,
    email: 'test@example.com',
    name: 'Test User',
  });

  // Verify in database
  const dbUser = await db.users.findById(id);
  expect(dbUser).toBeTruthy();
});
```

## 🚨 AI Testing Anti-Patterns to Avoid

### 1. **Coverage Theater**

```typescript
// ❌ This achieves 100% coverage but tests nothing
it('should call all methods', () => {
  const service = new UserService();
  service.create({});
  service.update('1', {});
  service.delete('1');
  service.find();
  expect(service).toBeDefined();
});
```

### 2. **Mock Everything**

```typescript
// ❌ Over-mocking makes tests useless
it('should create user', async () => {
  mockDb.create.mockResolvedValue({ id: '1' });
  mockValidator.validate.mockReturnValue(true);
  mockHasher.hash.mockResolvedValue('hashed');

  const result = await userService.create({});
  expect(result.id).toBe('1'); // This tests mocks, not logic
});
```

### 3. **Shallow Assertions**

```typescript
// ❌ Weak assertions
it('should process order', () => {
  const result = processOrder(order);
  expect(result).toBeTruthy();
  expect(typeof result.total).toBe('number');
});

// ✅ Strong assertions
it('should calculate order total with tax and shipping', () => {
  const order = {
    items: [{ price: 100, quantity: 2 }],
    shippingMethod: 'express',
  };

  const result = processOrder(order);

  expect(result).toEqual({
    subtotal: 200,
    tax: 20, // 10% tax
    shipping: 15, // express shipping
    total: 235,
    status: 'pending',
  });
});
```

## 📋 Test Review Checklist

Before approving any AI-generated test, verify:

- [ ] **Does the test fail when the business logic is broken?**

  - Change the implementation logic - does the test catch it?
  - This is what mutation testing validates

- [ ] **Would this test catch common production bugs?**

  - Null/undefined inputs
  - Empty collections
  - Concurrent access
  - Network failures

- [ ] **Can the implementation be refactored without changing tests?**

  - Tests should focus on public API, not internals
  - Changing variable names shouldn't break tests

- [ ] **Are all edge cases covered?**

  - Boundary values
  - Invalid inputs
  - Error conditions
  - Resource exhaustion

- [ ] **Do integration tests verify complete workflows?**
  - Not just HTTP status codes
  - Data persistence verification
  - Side effects validation

## 🎯 Quality Gate Enforcement

### Mutation Testing (Stryker)

```javascript
// stryker.config.mjs
{
  thresholds: {
    high: 90,
    low: 80,
    break: 90  // Fail build if below 90%
  }
}
```

### Property-Based Testing Requirements

```typescript
// Every utility function should have property tests
import fc from 'fast-check';

describe('formatCurrency properties', () => {
  it('should never return negative formatted values', () => {
    fc.assert(
      fc.property(fc.float(), amount => {
        const formatted = formatCurrency(Math.abs(amount));
        expect(formatted).toMatch(/^\$[\d,]+\.\d{2}$/);
      })
    );
  });
});
```

## 🔍 How to Spot AI-Generated Test Smells

### 1. **Repetitive Test Names**

```typescript
// 🚨 AI smell: Generic, unhelpful names
it('should work correctly');
it('should handle the case properly');
it('should return expected result');
```

### 2. **Missing Error Tests**

```typescript
// 🚨 AI smell: Only happy path tests
describe('UserService', () => {
  it('should create user'); // ✓
  it('should update user'); // ✓
  it('should delete user'); // ✓
  // Where are the error cases?
});
```

### 3. **Excessive Mocking**

```typescript
// 🚨 AI smell: Mocking things that shouldn't be mocked
jest.mock('../constants');
jest.mock('../types');
jest.mock('../utils/validators');
```

## 📚 Required Reading for AI Agents

When prompting AI agents to write tests, include:

1. **Link to this document**: "Follow AGENTS_TEST.md guidelines"
2. **Specific test category**: "Write integration tests for user creation workflow"
3. **Edge cases to cover**: "Include tests for concurrent creation, duplicate emails, malformed data"
4. **Quality requirements**: "Must achieve 90% mutation score"

## 🎨 Test Pattern Templates

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateTotal } from './calculations';

describe('calculateTotal', () => {
  // Happy path
  it('should calculate sum of item prices multiplied by quantities', () => {
    const items = [
      { price: 10.99, quantity: 2 },
      { price: 5.5, quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(38.48);
  });

  // Edge cases
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should handle negative prices', () => {
    expect(() => calculateTotal([{ price: -10, quantity: 1 }])).toThrow(
      'Price must be non-negative'
    );
  });

  // Property test
  it('should always return non-negative total', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            price: fc.float({ min: 0, max: 1000 }),
            quantity: fc.integer({ min: 0, max: 100 }),
          })
        ),
        items => {
          expect(calculateTotal(items)).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });
});
```

### Integration Test Template

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../helper';

describe('POST /orders - Order Creation Workflow', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create order and send confirmation email', async () => {
    // Arrange
    const orderData = {
      items: [{ productId: '123', quantity: 2 }],
      customerEmail: 'customer@example.com',
    };

    // Act
    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      payload: orderData,
    });

    // Assert - Response
    expect(response.statusCode).toBe(201);
    const order = JSON.parse(response.payload);
    expect(order).toMatchObject({
      id: expect.any(String),
      status: 'pending',
      total: expect.any(Number),
    });

    // Assert - Database
    const dbOrder = await app.db.orders.findById(order.id);
    expect(dbOrder).toBeTruthy();
    expect(dbOrder.items).toHaveLength(1);

    // Assert - Side Effects
    const emails = await app.emailService.getSentEmails();
    expect(emails).toContainEqual(
      expect.objectContaining({
        to: 'customer@example.com',
        subject: expect.stringContaining('Order Confirmation'),
      })
    );
  });

  it('should handle out-of-stock items', async () => {
    // Test the unhappy path...
  });
});
```

## 🚀 Enforcement

1. **Mutation Testing**: All PRs must maintain ≥90% mutation score
2. **Code Review**: Human review focuses on test quality, not just coverage
3. **AI Guidelines**: This document is referenced in all AI prompts for test generation
4. **Automated Checks**: ESLint rules enforce test structure and naming

Remember: **A false sense of security from bad tests is worse than no tests at all.**
