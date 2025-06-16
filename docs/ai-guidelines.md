# AI Development Guidelines

**Version:** 1.0.0  
**Last Updated:** June 16, 2025  
**Next Review:** September 16, 2025

## Version History

### v1.0.0 (June 16, 2025)
- **Initial Release:** Comprehensive AI development guidelines
- **Coverage:** Architecture patterns, testing strategies, common pitfalls
- **Tooling:** AI helper scripts and workflow integration
- **Quality Gates:** Success metrics and red flag indicators

---

## Why These Constraints Exist

This template uses strict constraints to guide AI agents toward maintainable, secure code:

### TypeScript Strict Mode
- Catches type errors before runtime
- Prevents `undefined` and `null` related bugs
- Makes refactoring safer for AI agents

### Zod Validation
- Runtime validation prevents silent failures
- Clear error messages for debugging
- Type inference reduces boilerplate

### Dependency Cruiser
- Prevents circular dependencies
- Enforces layered architecture
- Catches import violations early

### Mutation Testing
- Ensures tests actually validate logic
- Catches subtle bugs AI agents often miss
- Higher confidence in generated code

## Working with AI Agents

### Effective Prompts
```
"Add a new route that validates the request body with Zod and follows the existing error handling patterns"
```

### Less Effective Prompts
```
"Add a route" (too vague, likely to skip validation)
```

### When AI Gets Stuck
1. Check the pipeline output: `pnpm ci`
2. Look for specific error messages
3. Reference existing patterns in the codebase
4. Ask AI to fix one constraint at a time

## Architecture Patterns

### Route Structure
Routes should be thin and focused on HTTP concerns:

```typescript
// Good: Thin route with validation
export default async function routes(fastify: FastifyInstance) {
  fastify.post('/users', {
    schema: {
      body: CreateUserSchema,
      response: { 200: UserResponseSchema }
    }
  }, async (request, reply) => {
    const user = await userService.create(request.body);
    return reply.code(201).send(user);
  });
}
```

```typescript
// Bad: Business logic in route
export default async function routes(fastify: FastifyInstance) {
  fastify.post('/users', async (request, reply) => {
    // Don't put business logic here
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const user = await db.users.create({
      ...request.body,
      password: hashedPassword
    });
    return user;
  });
}
```

### Service Layer
Services contain business logic and are easily testable:

```typescript
// Good: Service with clear responsibilities
export class UserService {
  constructor(private db: Database, private logger: Logger) {}

  async create(userData: CreateUserInput): Promise<User> {
    this.logger.info({ userData: { email: userData.email } }, 'Creating user');
    
    const hashedPassword = await this.hashPassword(userData.password);
    const user = await this.db.users.create({
      ...userData,
      password: hashedPassword
    });

    this.logger.info({ userId: user.id }, 'User created successfully');
    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
```

### Error Handling
Use Fastify's error handling with proper status codes:

```typescript
// Good: Structured error handling
if (!user) {
  return reply.code(404).send({
    error: 'Not Found',
    message: 'User not found',
    statusCode: 404
  });
}

// Good: Using Fastify error handler
throw fastify.httpErrors.badRequest('Invalid user data');
```

```typescript
// Bad: Generic errors
throw new Error('Something went wrong');

// Bad: Exposing internal details
throw new Error(`Database connection failed: ${dbError.message}`);
```

### Validation Patterns
Always use Zod for runtime validation:

```typescript
// Good: Zod schema with proper types
const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100)
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

```typescript
// Bad: No validation
async function createUser(data: any) {
  // Dangerous - no validation
}

// Bad: Manual validation
if (!data.email || typeof data.email !== 'string') {
  throw new Error('Invalid email');
}
```

## Testing Patterns

### Unit Tests
Test business logic in isolation:

```typescript
// Good: Unit test for service
describe('UserService', () => {
  it('should hash password when creating user', async () => {
    const mockDb = { users: { create: vi.fn() } };
    const service = new UserService(mockDb, mockLogger);
    
    await service.create({ email: 'test@example.com', password: 'password123' });
    
    expect(mockDb.users.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: expect.not.stringMatching('password123') // Should be hashed
    });
  });
});
```

### Integration Tests
Test complete request/response cycles:

```typescript
// Good: Integration test
describe('POST /users', () => {
  it('should create user with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      email: 'test@example.com',
      name: 'Test User'
    });
    expect(response.json().password).toBeUndefined(); // Should not return password
  });
});
```

## Common AI Agent Mistakes

### 1. Skipping Validation
AI agents often forget input validation. Always validate:
- Request bodies with Zod schemas
- Query parameters
- Environment variables
- External API responses

### 2. Improper Error Handling
AI agents may use generic error handling. Use specific:
- HTTP status codes
- Structured error responses
- Proper logging context

### 3. Mixing Concerns
AI agents may put business logic in routes. Keep:
- Routes thin (HTTP concerns only)
- Services focused (business logic)
- Utils pure (no side effects)

### 4. Testing Shortcuts
AI agents may write shallow tests. Ensure:
- Unit tests for all business logic
- Integration tests for all routes
- Proper mocking of dependencies
- Edge case coverage

## Development Workflow

### Before Starting
1. Run `pnpm ai:check` to verify current state
2. Understand the existing patterns
3. Plan the changes with proper separation of concerns

### During Development
1. Write tests first (TDD approach)
2. Implement with proper validation
3. Run `pnpm lint:fix` frequently
4. Test both happy path and error cases

### Before Committing
1. Run `pnpm ai:check` to verify all constraints
2. Ensure all tests pass
3. Verify mutation test coverage
4. Check that no architectural violations exist

## AI Agent Success Metrics

### Code Quality Indicators
- ✅ All TypeScript strict mode checks pass
- ✅ All Zod validations in place
- ✅ No circular dependencies
- ✅ >90% mutation test coverage
- ✅ Proper error handling with status codes
- ✅ Clean separation of concerns

### Red Flags
- ❌ Any `any` types in production code
- ❌ Direct `process.env` access
- ❌ Business logic in routes
- ❌ Missing input validation
- ❌ Generic error messages
- ❌ Circular imports

## Getting Help

When AI agents encounter issues:

1. **Check the pipeline**: `pnpm ci` shows all constraint violations
2. **Reference existing code**: Look at similar patterns in the codebase
3. **Read error messages**: Biome, TypeScript, and tests provide specific guidance
4. **Fix one constraint at a time**: Don't try to fix everything at once

The constraints are designed to guide toward correct solutions, not block progress.

## Advanced Real-World Examples

### Complex Async Error Handling

```typescript
// Good: Comprehensive async error handling with proper logging
export class UserService {
  async createUserWithProfile(userData: CreateUserInput): Promise<UserWithProfile> {
    const transaction = await this.db.transaction();
    
    try {
      // Step 1: Create user
      const user = await transaction.users.create(userData);
      this.logger.info({ userId: user.id }, 'User created successfully');
      
      // Step 2: Create profile with retry logic
      const profile = await this.createProfileWithRetry(user.id, userData.profile, transaction);
      
      // Step 3: Send welcome email (non-blocking)
      this.emailService.sendWelcomeEmail(user.email).catch(error => {
        this.logger.error({ userId: user.id, error }, 'Failed to send welcome email');
        // Don't fail the entire operation for email issues
      });
      
      await transaction.commit();
      return { ...user, profile };
      
    } catch (error) {
      await transaction.rollback();
      
      if (error.code === 'UNIQUE_VIOLATION') {
        throw this.fastify.httpErrors.conflict('User already exists');
      }
      
      this.logger.error({ userData: { email: userData.email }, error }, 'User creation failed');
      throw this.fastify.httpErrors.internalServerError('Failed to create user');
    }
  }
  
  private async createProfileWithRetry(
    userId: string, 
    profileData: ProfileInput, 
    transaction: Transaction,
    maxRetries = 3
  ): Promise<Profile> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await transaction.profiles.create({ ...profileData, userId });
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        this.logger.warn({ userId, attempt, error }, 'Profile creation retry');
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
    throw new Error('Max retries exceeded'); // This should never be reached
  }
}
```

### Advanced Validation with Conditional Logic

```typescript
// Good: Complex validation with business rules
const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    customizations: z.record(z.string()).optional()
  })).min(1).max(50),
  shippingAddress: z.object({
    street: z.string().min(1).max(100),
    city: z.string().min(1).max(50),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.enum(['US', 'CA', 'MX'])
  }),
  paymentMethod: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('credit_card'),
      cardToken: z.string().min(1),
      cvv: z.string().regex(/^\d{3,4}$/)
    }),
    z.object({
      type: z.literal('paypal'),
      paypalEmail: z.string().email()
    })
  ]),
  promotionCode: z.string().optional()
}).refine(data => {
  // Business rule: Orders over $500 require phone verification
  const totalValue = data.items.reduce((sum, item) => sum + (item.quantity * 100), 0); // Simplified
  return totalValue <= 50000 || data.shippingAddress.phone !== undefined;
}, {
  message: "Orders over $500 require phone number for verification",
  path: ["shippingAddress", "phone"]
});

// Route implementation with comprehensive error handling
fastify.post('/orders', {
  schema: {
    body: CreateOrderSchema,
    response: {
      201: OrderResponseSchema,
      400: ErrorResponseSchema,
      409: ErrorResponseSchema,
      422: ValidationErrorResponseSchema
    }
  }
}, async (request, reply) => {
  try {
    const order = await orderService.createOrder(request.body, {
      userId: request.user.id,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
    
    return reply.code(201).send(order);
    
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return reply.code(422).send({
        error: 'Validation Failed',
        message: error.message,
        details: error.validationErrors
      });
    }
    
    if (error instanceof InsufficientInventoryError) {
      return reply.code(409).send({
        error: 'Insufficient Inventory',
        message: 'Some items are no longer available',
        unavailableItems: error.items
      });
    }
    
    // Log unexpected errors but don't expose details
    request.log.error({ error, orderId: error.orderId }, 'Order creation failed');
    throw fastify.httpErrors.internalServerError('Unable to process order');
  }
});
```

### Stream Processing with Error Boundaries

```typescript
// Good: Robust stream processing with proper cleanup
export class DataProcessingService {
  async processLargeDataset(
    dataStream: Readable,
    options: ProcessingOptions
  ): Promise<ProcessingResult> {
    const results: ProcessingResult = {
      processed: 0,
      errors: 0,
      startTime: Date.now()
    };
    
    const transform = new Transform({
      objectMode: true,
      transform: async (chunk, encoding, callback) => {
        try {
          const processed = await this.processChunk(chunk, options);
          results.processed++;
          callback(null, processed);
        } catch (error) {
          results.errors++;
          this.logger.error({ chunk: chunk.id, error }, 'Chunk processing failed');
          
          if (options.failFast) {
            callback(error);
          } else {
            // Continue processing, log error
            callback(null, { id: chunk.id, error: error.message });
          }
        }
      }
    });
    
    const cleanup = () => {
      dataStream.destroy();
      transform.destroy();
    };
    
    // Set up error boundaries
    dataStream.on('error', (error) => {
      this.logger.error({ error }, 'Data stream error');
      cleanup();
    });
    
    transform.on('error', (error) => {
      this.logger.error({ error }, 'Transform stream error');
      cleanup();
    });
    
    // Process with timeout
    const timeoutId = setTimeout(() => {
      this.logger.warn({ results }, 'Processing timeout reached');
      cleanup();
    }, options.timeoutMs || 300000); // 5 minutes default
    
    try {
      await pipeline(dataStream, transform, this.createOutputHandler(results));
      clearTimeout(timeoutId);
      
      results.endTime = Date.now();
      results.duration = results.endTime - results.startTime;
      
      return results;
      
    } catch (error) {
      clearTimeout(timeoutId);
      cleanup();
      throw error;
    }
  }
  
  private createOutputHandler(results: ProcessingResult) {
    return new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        // Handle processed results
        if (chunk.error) {
          results.errors++;
        }
        callback();
      }
    });
  }
}
```

### Enterprise-Grade Testing Patterns

```typescript
// Good: Comprehensive testing with realistic scenarios
describe('OrderService Integration', () => {
  let orderService: OrderService;
  let mockDb: MockDatabase;
  let mockPaymentService: MockPaymentService;
  let mockInventoryService: MockInventoryService;
  
  beforeEach(async () => {
    mockDb = new MockDatabase();
    mockPaymentService = new MockPaymentService();
    mockInventoryService = new MockInventoryService();
    
    orderService = new OrderService(
      mockDb,
      mockPaymentService,
      mockInventoryService,
      mockLogger
    );
  });
  
  describe('createOrder', () => {
    it('should handle concurrent order creation for limited inventory', async () => {
      // Setup: Product with limited inventory
      const productId = 'product-123';
      mockInventoryService.setStock(productId, 1); // Only 1 item available
      
      const orderData = {
        customerId: 'customer-123',
        items: [{ productId, quantity: 1 }]
      };
      
      // Act: Create two orders simultaneously
      const [result1, result2] = await Promise.allSettled([
        orderService.createOrder(orderData),
        orderService.createOrder(orderData)
      ]);
      
      // Assert: One succeeds, one fails with inventory error
      const successes = [result1, result2].filter(r => r.status === 'fulfilled');
      const failures = [result1, result2].filter(r => r.status === 'rejected');
      
      expect(successes).toHaveLength(1);
      expect(failures).toHaveLength(1);
      expect(failures[0].reason).toBeInstanceOf(InsufficientInventoryError);
    });
    
    it('should handle payment service timeout gracefully', async () => {
      // Setup: Payment service that times out
      mockPaymentService.simulateTimeout(5000);
      
      const orderData = createValidOrderData();
      
      // Act & Assert: Should fail with timeout error
      await expect(orderService.createOrder(orderData))
        .rejects.toThrow(PaymentTimeoutError);
      
      // Verify: Order was not saved to database
      expect(mockDb.orders.findByCustomerId(orderData.customerId))
        .resolves.toHaveLength(0);
    });
    
    it('should rollback transaction on partial failure', async () => {
      // Setup: Database that fails after user creation
      mockDb.orders.create.mockImplementationOnce(async () => {
        throw new Error('Database connection lost');
      });
      
      const orderData = createValidOrderData();
      
      // Act: Attempt to create order
      await expect(orderService.createOrder(orderData))
        .rejects.toThrow('Database connection lost');
      
      // Assert: No partial data was saved
      expect(mockDb.customers.findById(orderData.customerId))
        .resolves.toBeNull();
      expect(mockPaymentService.charges).toHaveLength(0);
    });
  });
});

// Helper function for test data generation
function createValidOrderData(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  return {
    customerId: faker.string.uuid(),
    items: [
      {
        productId: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 5 }),
        customizations: {}
      }
    ],
    shippingAddress: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      postalCode: faker.location.zipCode(),
      country: 'US'
    },
    paymentMethod: {
      type: 'credit_card',
      cardToken: faker.string.alphanumeric(20),
      cvv: faker.string.numeric(3)
    },
    ...overrides
  };
}
```

These advanced examples demonstrate:
- **Complex async patterns** with proper error boundaries
- **Sophisticated validation** with business rules
- **Stream processing** with cleanup and timeout handling  
- **Enterprise testing** with realistic failure scenarios
- **Transaction management** with rollback capabilities
- **Concurrent operation** handling with race conditions 