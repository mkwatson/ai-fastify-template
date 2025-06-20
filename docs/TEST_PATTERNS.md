# Test Patterns Library

> Reusable patterns for writing high-quality tests that resist AI agent pitfalls

## Table of Contents

1. [Test Data Builders](#test-data-builders)
2. [Async Error Handling](#async-error-handling)
3. [Mock Strategies](#mock-strategies)
4. [Property-Based Testing](#property-based-testing)
5. [Performance Testing](#performance-testing)
6. [Contract Testing](#contract-testing)
7. [Database Testing](#database-testing)
8. [API Testing Patterns](#api-testing-patterns)

## Test Data Builders

### Pattern: Builder Pattern for Test Data

Reduce test brittleness by centralizing test data creation:

```typescript
// test/builders/user.builder.ts
export class UserBuilder {
  private data: Partial<User> = {
    id: crypto.randomUUID(),
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  withId(id: string): UserBuilder {
    this.data.id = id;
    return this;
  }

  withEmail(email: string): UserBuilder {
    this.data.email = email;
    return this;
  }

  withRole(role: UserRole): UserBuilder {
    this.data.role = role;
    return this;
  }

  withoutId(): UserBuilder {
    delete this.data.id;
    return this;
  }

  build(): User {
    return { ...this.data } as User;
  }

  buildCreateRequest(): CreateUserRequest {
    const { id, createdAt, updatedAt, ...request } = this.data;
    return request as CreateUserRequest;
  }
}

// Usage in tests
it('should promote user to admin', async () => {
  const user = new UserBuilder()
    .withRole('user')
    .build();
  
  const promotedUser = await userService.promoteToAdmin(user.id);
  
  expect(promotedUser.role).toBe('admin');
});
```

### Pattern: Mother Object Pattern

For complex domain objects:

```typescript
// test/mothers/order.mother.ts
export class OrderMother {
  static simple(): Order {
    return new OrderBuilder()
      .withItems([{ productId: '1', quantity: 1, price: 10 }])
      .withStatus('pending')
      .build();
  }

  static withMultipleItems(): Order {
    return new OrderBuilder()
      .withItems([
        { productId: '1', quantity: 2, price: 10 },
        { productId: '2', quantity: 1, price: 25 },
      ])
      .build();
  }

  static completed(): Order {
    return new OrderBuilder()
      .withStatus('completed')
      .withCompletedAt(new Date())
      .build();
  }

  static highValue(): Order {
    return new OrderBuilder()
      .withItems([
        { productId: 'luxury-1', quantity: 1, price: 1000 },
      ])
      .withPriority('high')
      .build();
  }
}
```

## Async Error Handling

### Pattern: Testing Async Rejections

```typescript
describe('Async Error Handling', () => {
  it('should handle promise rejections', async () => {
    // Using expect().rejects
    await expect(
      userService.createUser({ email: 'invalid-email' })
    ).rejects.toThrow('Invalid email format');
  });

  it('should handle async function errors', async () => {
    // Using try-catch for more complex assertions
    try {
      await processPayment({ amount: -100 });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('negative amount');
      expect(error.code).toBe('INVALID_AMOUNT');
    }
  });

  it('should handle timeout errors', async () => {
    vi.useFakeTimers();
    
    const promise = fetchWithTimeout('https://slow-api.com', 1000);
    
    // Fast-forward time
    vi.advanceTimersByTime(1001);
    
    await expect(promise).rejects.toThrow('Request timeout');
    
    vi.useRealTimers();
  });
});
```

### Pattern: Testing Event Emitters

```typescript
describe('Event Emitter Error Handling', () => {
  it('should handle errors in event listeners', (done) => {
    const emitter = new EventEmitter();
    
    emitter.on('error', (error) => {
      expect(error.message).toBe('Processing failed');
      done();
    });
    
    emitter.on('data', () => {
      throw new Error('Processing failed');
    });
    
    emitter.emit('data', { id: 1 });
  });
});
```

## Mock Strategies

### Pattern: Minimal Mocking

Only mock what you need to isolate the unit under test:

```typescript
describe('UserService', () => {
  let userService: UserService;
  let mockDb: MockDatabase;

  beforeEach(() => {
    // Only mock the database, not validators or helpers
    mockDb = createMockDatabase();
    userService = new UserService(mockDb, new RealValidator());
  });

  it('should validate email before saving', async () => {
    const invalidUser = { email: 'not-an-email', name: 'Test' };
    
    await expect(userService.create(invalidUser))
      .rejects.toThrow('Invalid email format');
    
    // Verify database was never called
    expect(mockDb.users.create).not.toHaveBeenCalled();
  });
});
```

### Pattern: Spy Pattern for Side Effects

```typescript
describe('EmailService', () => {
  it('should log email sending', async () => {
    const logSpy = vi.spyOn(logger, 'info');
    
    await emailService.send({
      to: 'user@example.com',
      subject: 'Welcome',
      body: 'Welcome to our service!',
    });
    
    expect(logSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'email_sent',
        to: 'user@example.com',
        subject: 'Welcome',
      }),
      'Email sent successfully'
    );
  });
});
```

## Property-Based Testing

### Pattern: Invariant Testing

```typescript
import fc from 'fast-check';

describe('Discount Calculator Properties', () => {
  it('discount should never exceed item price', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10000 }), // price
        fc.float({ min: 0, max: 1 }),     // discount percentage
        (price, discountPercent) => {
          const discount = calculateDiscount(price, discountPercent);
          expect(discount).toBeLessThanOrEqual(price);
          expect(discount).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it('should be idempotent', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 10000 }),
        (price) => {
          const once = applyRounding(price);
          const twice = applyRounding(once);
          expect(twice).toBe(once);
        }
      )
    );
  });
});
```

### Pattern: Model-Based Testing

```typescript
describe('Shopping Cart Model', () => {
  it('should maintain invariants through operations', () => {
    fc.assert(
      fc.property(
        fc.commands([
          fc.constant(new AddItemCommand()),
          fc.constant(new RemoveItemCommand()),
          fc.constant(new UpdateQuantityCommand()),
          fc.constant(new ClearCartCommand()),
        ]),
        (commands) => {
          const cart = new ShoppingCart();
          const model = new CartModel();

          commands.forEach(cmd => {
            cmd.run(cart);
            cmd.run(model);
          });

          // Invariants
          expect(cart.total).toBeGreaterThanOrEqual(0);
          expect(cart.items.length).toBe(model.items.length);
          expect(cart.total).toBeCloseTo(model.calculateTotal(), 2);
        }
      )
    );
  });
});
```

## Performance Testing

### Pattern: Response Time Benchmarks

```typescript
describe('Performance Benchmarks', () => {
  it('should process requests within SLA', async () => {
    const iterations = 100;
    const maxTime = 50; // ms
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await processRequest({ id: i });
      const end = performance.now();
      times.push(end - start);
    }

    const p95 = percentile(times, 0.95);
    const p99 = percentile(times, 0.99);

    expect(p95).toBeLessThan(maxTime);
    expect(p99).toBeLessThan(maxTime * 1.5);
  });
});
```

### Pattern: Memory Leak Detection

```typescript
describe('Memory Management', () => {
  it('should not leak memory in cache', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const cache = new LRUCache({ max: 1000 });

    // Perform many operations
    for (let i = 0; i < 10000; i++) {
      cache.set(`key-${i}`, { data: new Array(1000).fill(i) });
    }

    // Force garbage collection (requires --expose-gc flag)
    global.gc?.();

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = finalMemory - initialMemory;

    // Should not grow beyond cache size limit
    expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // 10MB
  });
});
```

## Contract Testing

### Pattern: Consumer-Driven Contracts

```typescript
// Consumer test
describe('User API Consumer', () => {
  const provider = new PactV3({
    consumer: 'Frontend',
    provider: 'UserAPI',
  });

  it('should get user by ID', async () => {
    // Define expected interaction
    await provider
      .given('user with ID 123 exists')
      .uponReceiving('a request for user 123')
      .withRequest({
        method: 'GET',
        path: '/users/123',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: '123',
          email: 'user@example.com',
          name: 'Test User',
        },
      });

    await provider.executeTest(async (mockServer) => {
      const user = await fetchUser(mockServer.url, '123');
      expect(user.email).toBe('user@example.com');
    });
  });
});
```

## Database Testing

### Pattern: Transaction Rollback Testing

```typescript
describe('Database Transactions', () => {
  let db: Database;
  let transaction: Transaction;

  beforeEach(async () => {
    db = await createTestDatabase();
    transaction = await db.beginTransaction();
  });

  afterEach(async () => {
    await transaction.rollback();
    await db.close();
  });

  it('should rollback on error', async () => {
    try {
      await transaction.users.create({ email: 'test@example.com' });
      await transaction.orders.create({ userId: 'invalid' }); // This will fail
      await transaction.commit();
    } catch (error) {
      // Transaction automatically rolled back
    }

    // Verify nothing was saved
    const userCount = await db.users.count();
    expect(userCount).toBe(0);
  });
});
```

### Pattern: Test Data Isolation

```typescript
describe('Data Isolation', () => {
  const testId = crypto.randomUUID();

  beforeEach(async () => {
    // Prefix all test data with unique ID
    await seedTestData(testId);
  });

  afterEach(async () => {
    // Clean up only this test's data
    await cleanupTestData(testId);
  });

  it('should not interfere with other tests', async () => {
    const user = await createUser({
      email: `user-${testId}@example.com`,
      name: `Test User ${testId}`,
    });

    expect(user.email).toContain(testId);
  });
});
```

## API Testing Patterns

### Pattern: Request/Response Validation

```typescript
describe('API Validation', () => {
  it('should validate request against schema', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'not-an-email', // Invalid
        name: 'a', // Too short
      },
    });

    expect(response.statusCode).toBe(400);
    const errors = JSON.parse(response.payload);
    expect(errors).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      validation: [
        { field: 'email', message: 'Invalid email format' },
        { field: 'name', message: 'Name must be at least 2 characters' },
      ],
    });
  });
});
```

### Pattern: Authentication Testing

```typescript
describe('Authentication', () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token once for all tests
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'test@example.com', password: 'password123' },
    });
    
    authToken = JSON.parse(response.payload).token;
  });

  it('should access protected route with valid token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/protected/data',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.statusCode).toBe(200);
  });

  it('should reject invalid token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/protected/data',
      headers: { Authorization: 'Bearer invalid-token' },
    });

    expect(response.statusCode).toBe(401);
  });
});
```

## Best Practices Summary

1. **Use builders for test data** - Centralizes changes and reduces brittleness
2. **Test behaviors, not implementations** - Focus on outcomes, not mechanics
3. **Include unhappy paths** - Error cases are often more important than success cases
4. **Isolate test data** - Prevent test interference with unique identifiers
5. **Mock sparingly** - Only mock external dependencies, not internal modules
6. **Use property tests for algorithms** - Catch edge cases you didn't think of
7. **Benchmark critical paths** - Ensure performance doesn't degrade
8. **Validate contracts** - Ensure API compatibility between services

Remember: These patterns are tools. Choose the right pattern for your specific testing needs.