# AI Coding Guidelines for ai-fastify-template

## Project Overview & Quick Start

**Tech Stack**: Fastify + TypeScript + Zod + TurboRepo monorepo with comprehensive quality guardrails

**Key Directories**:

- `apps/backend-api/` - Main Fastify API server
- `packages/` - Shared libraries and utilities
- `docs/` - Documentation
- `scripts/` - Build and validation utilities

**Essential Commands**:

```bash
pnpm install           # Install dependencies
pnpm dev               # Start development servers
pnpm ai:quick          # Quick validation (lint + types)
pnpm ai:check          # Standard validation (includes graph validation)
pnpm ai:compliance     # Full compliance validation
pnpm build             # Production build
pnpm test              # Run all tests
```

## Development Environment

**Required Tools**:

- Node.js >= 20.0.0
- pnpm >= 10.0.0
- Git >= 2.0.0

**Setup Verification**:

```bash
node --version && pnpm --version && git --version
pnpm install && pnpm ai:quick
```

**Development Workflow**:

```bash
# Start new feature
git checkout main && git pull origin main
git checkout -b feature/your-feature-name
pnpm install

# During development
pnpm ai:quick          # Fast feedback during coding
pnpm dev               # Start development servers

# Before committing
pnpm ai:check          # Comprehensive validation
git add . && git commit -m "feat(scope): description"
# Note: Husky + lint-staged automatically runs ESLint and Prettier on staged files

# Before PR
pnpm ai:compliance     # Full quality pipeline
```

## Architecture Principles

### Monorepo Structure Rules

- **Apps → Packages**: ✅ Apps can depend on packages
- **Packages → Packages**: ✅ Packages can depend on other packages
- **Apps → Apps**: ❌ Apps cannot depend on other apps
- **Packages → Apps**: ❌ Packages cannot depend on apps

### TypeScript Strict Mode Requirements

We use the **@tsconfig/strictest** preset which enforces:

- **No `any` types**: Use specific types or `unknown` with type guards
- **Explicit return types**: For all public functions and methods
- **Strict null checks**: Handle `null` and `undefined` explicitly
- **No implicit returns**: All code paths must return values
- **All strict flags enabled**: Including `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and more

This preset provides Rust-like safety through TypeScript's built-in features rather than complex external tooling.

```typescript
// ✅ Good: Explicit types and proper handling
interface CreateUserRequest {
  email: string;
  name: string;
  role?: 'user' | 'admin';
}

function createUser(data: CreateUserRequest): Promise<User> {
  // Implementation with proper error handling
}

// ❌ Bad: Implicit any and unsafe patterns
function createUser(data: any): any {
  // Unsafe implementation
}
```

### Zod Validation Patterns

- **All inputs validated**: Request bodies, query params, environment variables
- **Type inference**: Use `z.infer<typeof Schema>` for TypeScript types
- **Runtime safety**: Validate at API boundaries and external data sources

```typescript
// ✅ Good: Zod schema with type inference
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'admin']).optional(),
});

type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// ✅ Good: Route with validation
fastify.post(
  '/users',
  {
    schema: {
      body: CreateUserSchema,
      response: { 201: UserResponseSchema },
    },
  },
  async (request, reply) => {
    const userData = CreateUserSchema.parse(request.body);
    // Safe to use userData with full type safety
  }
);
```

### Type Safety Patterns with Branded Types

The project implements **branded types** for compile-time ID safety, preventing ID mixups that cause runtime errors. This enterprise-grade approach ensures type safety while maintaining runtime validation.

#### Core Principles

- **Compile-time safety**: Prevent ID confusion at build time
- **Runtime validation**: Ensure data integrity with validation constructors
- **Zero performance overhead**: Brands are phantom types (compile-time only)
- **API boundary protection**: Integrate with Zod for request/response validation

#### Basic Usage

```typescript
import { UserId, OrderId, ProductId } from '@ai-fastify-template/types';

// ✅ Type-safe ID creation with validation
const userId = UserId('550e8400-e29b-41d4-a716-446655440000');
const orderId = OrderId('660e8400-e29b-41d4-a716-446655440000');

// ❌ Compile error: Cannot mix ID types
function processOrder(orderId: OrderId) {
  /* ... */
}
processOrder(userId); // TypeScript Error: UserId is not assignable to OrderId

// ✅ Type-safe operations
function processOrder(orderId: OrderId) {
  // orderId is guaranteed to be a valid, branded OrderId
  console.log(`Processing order: ${orderId}`);
}
processOrder(orderId); // ✅ Correct type
```

#### API Route Integration with Zod

```typescript
import { ZodBrandedSchemas } from '@ai-fastify-template/types';

// ✅ Type-safe route parameters
const GetUserParams = z.object({
  userId: ZodBrandedSchemas.UserId,
});

const CreateOrderBody = z.object({
  customerId: ZodBrandedSchemas.CustomerId,
  items: z.array(
    z.object({
      productId: ZodBrandedSchemas.ProductId,
      quantity: z.number().int().positive(),
    })
  ),
});

// ✅ Fastify route with branded type safety
fastify.post(
  '/orders',
  {
    schema: {
      body: CreateOrderBody,
      response: { 201: OrderResponseSchema },
    },
  },
  async (request, reply) => {
    // request.body.customerId is typed as CustomerId (branded)
    // request.body.items[0].productId is typed as ProductId (branded)

    const order = await orderService.createOrder(request.body);
    return reply.code(201).send(order);
  }
);
```

#### Available Entity Types

**User Management Domain:**

- `UserId`, `SessionId`, `RoleId`

**E-commerce Domain:**

- `ProductId`, `OrderId`, `CustomerId`, `CategoryId`

**Content Management:**

- `ArticleId`, `CommentId`, `AuthorId`

**System Resources:**

- `RequestId`, `TransactionId`, `LogId`

**Alternative Types:**

- `EmailAddress` (email validation)
- `Slug` (URL-friendly strings)

#### Service Layer Patterns

```typescript
// ✅ Type-safe service methods
export class OrderService {
  async createOrder(data: {
    customerId: CustomerId;
    items: Array<{ productId: ProductId; quantity: number }>;
  }): Promise<Order> {
    // Compile-time guarantee that IDs are correct types
    const customer = await this.customerRepo.findById(data.customerId);
    const products = await this.productRepo.findByIds(
      data.items.map(item => item.productId)
    );

    // Business logic with type safety
    return this.orderRepo.create({
      customerId: data.customerId,
      items: data.items,
    });
  }

  // ❌ This would be a compile error:
  async getOrdersByUser(orderId: OrderId): Promise<Order[]> {
    // return this.orderRepo.findByCustomerId(orderId); // Error!
    // OrderId cannot be used where CustomerId is expected
  }
}
```

#### Error Prevention Examples

```typescript
// Common ID mixup scenarios that branded types prevent:

// ❌ Without branded types (dangerous):
function transferOrder(fromUserId: string, toUserId: string, orderId: string) {
  // Easy to accidentally swap parameters
  return orderService.transfer(orderId, fromUserId, toUserId); // Bug!
}

// ✅ With branded types (safe):
function transferOrder(fromUser: UserId, toUser: UserId, order: OrderId) {
  // Compile error if parameters are swapped
  return orderService.transfer(order, fromUser, toUser); // ✅ Correct
}

// ❌ Database query mixups (dangerous):
const orders = await db.query('SELECT * FROM orders WHERE customer_id = ?', [
  productId,
]); // Bug!

// ✅ Type-safe queries (safe):
const orders = await db.query('SELECT * FROM orders WHERE customer_id = ?', [
  customerId,
]); // ✅ Correct
```

#### Testing with Branded Types

```typescript
// ✅ Test branded type validation
describe('OrderService', () => {
  it('should create order with valid IDs', () => {
    const customerId = CustomerId('550e8400-e29b-41d4-a716-446655440000');
    const productId = ProductId('660e8400-e29b-41d4-a716-446655440000');

    const order = orderService.createOrder({
      customerId,
      items: [{ productId, quantity: 2 }],
    });

    expect(order.customerId).toBe(customerId);
  });

  it('should reject invalid UUID format', () => {
    expect(() => UserId('invalid-uuid')).toThrow('Invalid UUID format');
  });
});
```

#### Unsafe Constructors (Use with Caution)

```typescript
// When you're certain a value is valid (e.g., from database)
import { UnsafeUserId } from '@ai-fastify-template/types';

const userId = UnsafeUserId(dbRecord.user_id); // Skips validation
```

#### Migration Strategy

```typescript
// Step 1: Add branded types gradually
type UserId = Brand<string, 'UserId'>;

// Step 2: Update function signatures
function getUser(id: UserId): Promise<User> {
  /* ... */
}

// Step 3: Update call sites
const userId = UserId(request.params.id);
const user = await getUser(userId);

// Step 4: Add Zod integration for API routes
```

### Fastify Architectural Patterns

- **Thin routes**: Keep HTTP concerns separate from business logic
- **Plugin architecture**: Use Fastify plugins for modular functionality
- **Service layer**: Business logic in dedicated service classes
- **Dependency injection**: Services receive dependencies via constructor

```typescript
// ✅ Good: Thin route with service delegation
fastify.post(
  '/users',
  {
    schema: { body: CreateUserSchema },
  },
  async (request, reply) => {
    const user = await fastify.userService.createUser(request.body);
    return reply.code(201).send(user);
  }
);

// ✅ Good: Service with clear responsibilities
export class UserService {
  constructor(
    private readonly db: DatabaseClient,
    private readonly logger: Logger
  ) {}

  async createUser(data: CreateUserRequest): Promise<User> {
    this.logger.info({ email: data.email }, 'Creating user');
    // Business logic implementation
  }
}
```

## Code Quality Standards

### Input Validation Requirements

- **No direct `process.env` access**: Use validated environment schemas
- **Request validation**: All routes with request bodies must use Zod schemas
- **External data validation**: Validate all data from external APIs/databases

```typescript
// ✅ Good: Validated environment configuration
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().regex(/^\d+$/).transform(Number),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
});

export const env = EnvSchema.parse(process.env);

// ❌ Bad: Direct process.env access
const port = process.env.PORT; // Unsafe!
```

### Error Handling Standards

- **Fastify error patterns**: Use `fastify.httpErrors` for HTTP errors
- **Structured errors**: Consistent error response format
- **No generic Error throwing**: Use specific error types
- **Proper logging**: Log errors with context, not sensitive data

```typescript
// ✅ Good: Fastify error handling
if (!user) {
  throw fastify.httpErrors.notFound('User not found');
}

// ✅ Good: Custom error classes
class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User with id ${id} not found`);
    this.name = 'UserNotFoundError';
  }
}

// ❌ Bad: Generic error throwing in routes
throw new Error('Something went wrong'); // Too generic!
```

### Security Requirements

- **Input sanitization**: All user inputs validated and sanitized
- **No secrets in code**: Use environment variables for all sensitive data
- **Parameterized queries**: No string concatenation for database queries
- **Secure headers**: Use Fastify security plugins

### Enterprise Security Guardrails

The project implements comprehensive security scanning and validation at multiple layers:

**Pre-commit Security Hooks:**

- **GitLeaks credential scanning**: Prevents accidental commit of secrets, API keys, tokens
- **File hygiene validation**: Blocks large files (>1MB), detects merge conflicts
- **Configuration validation**: YAML/JSON syntax verification prevents config corruption
- **Dependency auditing**: Automatic vulnerability scanning with `audit-ci`

**ESLint Security Rules:**

- **Object injection protection**: `security/detect-object-injection`
- **Regex safety**: `security/detect-unsafe-regex` and `security/detect-non-literal-regexp`
- **Custom architectural patterns**: Enforces secure coding practices specific to this project

**Runtime Security:**

- **Environment validation**: All environment variables validated with Zod schemas
- **Input validation**: Request body validation mandatory via custom ESLint rules
- **Error handling**: Fastify-specific error patterns enforced by linting rules

```bash
# Security validation commands
pnpm ai:security          # Run dependency audit
npx gitleaks detect       # Scan for credentials (automatic in pre-commit)
pnpm lint                 # Security linting rules
```

## Testing & Validation Standards

### Quality Pipeline Commands

```bash
# Layer 1: Fast feedback (<5 sec)
pnpm ai:quick          # lint + type-check

# Layer 2: Standard validation (<30 sec)
pnpm ai:check          # ai:quick + graph validation

# Layer 3: Full validation
pnpm ai:compliance     # ai:check + tests + mutation testing + build

# Individual checks
pnpm lint              # ESLint + Prettier with minimal runtime-safety rules
pnpm type-check        # TypeScript compilation
pnpm test              # Unit and integration tests (Vitest)
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
pnpm test:mutation     # Mutation testing (Stryker) - enterprise-grade quality standards
pnpm build             # Production build verification
```

### Minimal ESLint Configuration (Runtime Safety Focus)

Our ESLint configuration is **minimal and focused** on catching runtime issues that TypeScript cannot detect:

**Runtime Safety Rules (~40 lines total):**

- **Environment validation**: No direct `process.env` access - must use Zod schemas
- **Request validation**: All route handlers must validate request bodies with Zod
- **Error handling**: Fastify-specific error patterns (no generic Error throws)
- **Async safety**: Floating promise prevention
- **Import hygiene**: Circular dependency detection

**Why Minimal?**

- TypeScript's @tsconfig/strictest preset handles most type safety
- Prettier handles all formatting automatically
- Focus on **runtime safety** that compile-time checks miss
- Easier to understand and maintain (~40 lines vs 400+)

**Key Architectural Rules:**

```typescript
// ✅ Environment validation required
const env = EnvSchema.parse(process.env);

// ❌ Direct access forbidden
const port = process.env.PORT; // ESLint error

// ✅ Request validation required
fastify.post(
  '/users',
  {
    schema: { body: CreateUserSchema },
  },
  handler
);

// ❌ Unvalidated requests forbidden
fastify.post('/users', async req => {
  const data = req.body; // ESLint error
});
```

### Testing Requirements (Vitest Framework)

- **Unit tests**: For all business logic and utility functions
- **Integration tests**: For all API routes and plugin functionality
- **Test coverage**: Maintain high line coverage (configured in vitest.config.ts)
- **Test structure**: Arrange-Act-Assert pattern with descriptive names
- **Test helpers**: Use shared test helpers for consistent app setup
- **Zod validation testing**: Test input validation and error cases

### Mutation Testing (Stryker) - ENTERPRISE QUALITY GATE

**Purpose**: Ensures tests actually validate business logic, not just achieve coverage metrics.

**Requirements**:

- **Minimum mutation score**: Enterprise-grade standards (enforced in CI/CD)
- **Strategic exclusions**: Only exclude low-business-value code (bootstrap, error formatting)
- **Dual test strategy**: Both unit tests (direct imports) and integration tests (full app)
- **Property-based testing**: Use fast-check for comprehensive edge case coverage

**Configuration**:

```bash
pnpm test:mutation    # Run mutation tests
pnpm ai:compliance    # Includes mutation testing in full pipeline
```

**Key Patterns**:

- **Focus on business logic**: Exclude bootstrap files (`server.ts`, `app.ts`)
- **Document exclusions**: Each exclusion requires clear rationale
- **Incremental improvement**: Start with baseline threshold, work up to enterprise standards
- **No fake tests**: Don't write tests just to improve metrics

See [docs/MUTATION_TESTING_GUIDE.md](./docs/MUTATION_TESTING_GUIDE.md) for detailed implementation patterns.

### 🚨 CRITICAL: AI Agent Testing Guidelines

**The goal is not coverage, it's confidence.** Tests that don't fail when logic is broken are worse than no tests.

#### Core Testing Principles

1. **Test Behavior, Not Implementation**

   - Focus on WHAT the code does, not HOW
   - Tests should survive refactoring
   - Mock only external dependencies

2. **Edge Cases Are MANDATORY**

   - Every function MUST test: null, undefined, empty, boundary values
   - Use property-based testing for comprehensive coverage
   - Test error conditions and recovery paths

3. **Integration Tests Must Test Workflows**
   - Not just "returns 200"
   - Full create-read-update-delete cycles
   - Error recovery scenarios
   - Side effects validation

#### AI Testing Anti-Patterns to Avoid

```typescript
// ❌ BAD: Coverage theater - achieves 100% coverage but tests nothing
it('should work', () => {
  const result = calculateTax(100);
  expect(result).toBeDefined();
  expect(typeof result).toBe('number');
});

// ✅ GOOD: Logic validation
it('should calculate 10% tax on standard items', () => {
  const result = calculateTax(100, 'standard');
  expect(result).toBe(10);
});

it('should calculate 0% tax on exempt items', () => {
  const result = calculateTax(100, 'exempt');
  expect(result).toBe(0);
});

it('should throw error for negative amounts', () => {
  expect(() => calculateTax(-100, 'standard')).toThrow(
    'Amount must be positive'
  );
});

// ❌ BAD: Testing framework instead of business logic
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
});
```

#### Test Quality Checklist

Before approving any AI-generated test, verify:

- [ ] **Does the test fail when the business logic is broken?**
- [ ] **Would this test catch common production bugs?**
- [ ] **Can the implementation be refactored without changing tests?**
- [ ] **Are all edge cases covered?**
- [ ] **Do integration tests verify complete workflows?**

#### Test Structure Examples

```typescript
// ✅ Good: Unit test with edge cases
import { describe, it, expect } from 'vitest';
import { calculateTotal, type Item } from '../../src/utils/calculations.js';

describe('calculateTotal', () => {
  // Happy path
  it('should calculate total for multiple items', () => {
    const items: Item[] = [
      { price: 10, quantity: 2 },
      { price: 5.99, quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(37.97);
  });

  // REQUIRED edge cases
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should handle single item', () => {
    expect(calculateTotal([{ price: 10, quantity: 1 }])).toBe(10);
  });

  it('should throw error for negative price', () => {
    const items = [{ price: -10, quantity: 2 }];
    expect(() => calculateTotal(items)).toThrow('Price must be non-negative');
  });

  it('should throw error for negative quantity', () => {
    const items = [{ price: 10, quantity: -2 }];
    expect(() => calculateTotal(items)).toThrow(
      'Quantity must be non-negative'
    );
  });

  it('should handle decimal precision', () => {
    const items = [{ price: 0.1, quantity: 3 }];
    expect(calculateTotal(items)).toBeCloseTo(0.3, 2);
  });
});

// ✅ Good: Integration test structure
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { build } from '../helper.js';

describe('User routes - Complete Workflow', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should handle complete user lifecycle', async () => {
    // Create user
    const createResponse = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { email: 'test@example.com', name: 'Test User' },
    });

    expect(createResponse.statusCode).toBe(201);
    const createdUser = JSON.parse(createResponse.payload);
    expect(createdUser).toMatchObject({
      id: expect.any(String),
      email: 'test@example.com',
      name: 'Test User',
    });

    // Update user
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/users/${createdUser.id}`,
      payload: { name: 'Updated Name' },
    });

    expect(updateResponse.statusCode).toBe(200);
    const updatedUser = JSON.parse(updateResponse.payload);
    expect(updatedUser.name).toBe('Updated Name');

    // Delete user
    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/users/${createdUser.id}`,
    });

    expect(deleteResponse.statusCode).toBe(204);

    // Verify deletion
    const getResponse = await app.inject({
      method: 'GET',
      url: `/users/${createdUser.id}`,
    });

    expect(getResponse.statusCode).toBe(404);
  });

  it('should validate input and return structured errors', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'invalid-email',
        name: 'a', // Too short
      },
    });

    expect(response.statusCode).toBe(400);
    const error = JSON.parse(response.payload);
    expect(error).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      validation: expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'name' }),
      ]),
    });
  });
});
```

### Mutation Testing (Stryker)

- **Mutation score**: Enterprise-grade quality standards - enforced in CI
- **Purpose**: Ensure tests actually validate business logic
- **Configuration**: `stryker.config.mjs` with enterprise-grade break threshold
- **Run**: `pnpm test:mutation`

#### Why Mutation Testing Matters

```typescript
// Original function
function calculateDiscount(price: number, discount: number): number {
  return price - price * discount;
}

// Mutation: Changed * to +
function calculateDiscount(price: number, discount: number): number {
  return price - (price + discount); // BUG introduced by mutator
}

// ❌ Weak test (passes with mutation)
it('should apply discount', () => {
  expect(calculateDiscount(100, 0.1)).toBeLessThan(100);
});

// ✅ Strong test (fails with mutation)
it('should calculate 10% discount correctly', () => {
  expect(calculateDiscount(100, 0.1)).toBe(90);
});
```

### 🚨 MANDATORY: Property-Based Testing Requirements

**ENTERPRISE PRIORITY: TIER 1 - CRITICAL FOUNDATION**

Property-based testing is **MANDATORY** for all business logic functions. This provides mathematical guarantees about function behavior by testing thousands of generated cases, catching edge cases that traditional unit tests miss.

#### ESLint Enforcement

A custom ESLint rule enforces property testing requirements and accepts multiple patterns:

```typescript
// ❌ ESLint Error: Business logic function requires property-based tests
export function calculateTotal(items: Item[]): number {
  // Implementation...
}

// ✅ Option 1: Simple API (recommended for most use cases)
import {
  propertyTest,
  generators,
} from '@ai-fastify-template/types/property-testing-simple';

describe('calculateTotal - properties', () => {
  it('should maintain mathematical invariants', () => {
    propertyTest(calculateTotal, generators.items(), ['nonNegative', 'finite']);
  });
});

// ✅ Option 2: Convenience functions for common patterns
describe('calculateTotal - properties', () => {
  it('should satisfy financial function requirements', () => {
    testFinancialFunction(calculateTotal, generators.items());
  });
});

// ✅ Option 3: Complex API (for advanced cases)
describe('calculateTotal - properties', () => {
  it('should maintain complex invariants', () => {
    fc.assert(
      fc.property(generators.items(), items => {
        const total = calculateTotal(items);
        expect(total).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(total)).toBe(true);
      })
    );
  });
});
```

**Recommendation**: Start with the simple API (Option 1) for 90% of use cases. Use the complex API only when you need custom invariants not covered by the built-in patterns.

#### Core Property Testing Patterns

**1. Mathematical Invariants**

Properties that must always hold regardless of input:

```typescript
import {
  testInvariants,
  financialAmount,
  quantity,
} from '@ai-fastify-template/types';

// Non-negative results
testInvariants(
  fc.array(fc.record({ price: financialAmount(), quantity: quantity() })),
  calculateTotal,
  [
    (input, output) => output >= 0,
    (input, output) => Number.isFinite(output),
    (input, output) => (input.length === 0 ? output === 0 : true),
  ]
);

// Monotonicity (more items = higher/equal total)
fc.assert(
  fc.property(fc.array(itemRecord(), { minLength: 1 }), items => {
    const fullTotal = calculateTotal(items);
    const partialTotal = calculateTotal(items.slice(0, -1));
    expect(partialTotal).toBeLessThanOrEqual(fullTotal);
  })
);
```

**2. Business Logic Invariants**

Domain-specific rules that must hold:

```typescript
// Tax calculation properties
fc.assert(
  fc.property(
    fc.array(itemRecord()),
    fc.float({ min: 0, max: 1 }),
    (items, taxRate) => {
      const baseTotal = calculateTotal(items);
      const totalWithTax = calculateTotalWithTax(items, taxRate);

      // Tax increases total (or keeps it same for 0% tax)
      expect(totalWithTax).toBeGreaterThanOrEqual(baseTotal);

      // Correct tax calculation
      const expectedTax = baseTotal * taxRate;
      expect(totalWithTax).toBeCloseTo(baseTotal + expectedTax, 2);
    }
  )
);

// Discount properties
fc.assert(
  fc.property(
    financialAmount(),
    fc.float({ min: 0, max: 100 }),
    (price, discountPercent) => {
      const discount = calculateDiscount(price, discountPercent);

      // Discount never exceeds price
      expect(discount).toBeLessThanOrEqual(price);
      expect(discount).toBeGreaterThanOrEqual(0);

      // Correct percentage calculation
      const expectedDiscount = price * (discountPercent / 100);
      expect(discount).toBeCloseTo(expectedDiscount, 2);
    }
  )
);
```

**3. Composition Properties**

Testing function composition and equivalence:

```typescript
import { testComposition } from '@ai-fastify-template/types';

// Two ways of calculating should give same result
testComposition(
  fc.array(itemRecord()),
  items => calculateTotalWithTax(items, 0.1),
  items => calculateTotal(items) * 1.1,
  (a, b) => Math.abs(a - b) < 0.01 // Allow floating point errors
);
```

**4. Order Independence (Commutativity)**

```typescript
// Order of items shouldn't matter for total
fc.assert(
  fc.property(fc.array(itemRecord(), { minLength: 2 }), items => {
    const total1 = calculateTotal(items);
    const shuffled = [...items].reverse();
    const total2 = calculateTotal(shuffled);
    expect(total1).toBeCloseTo(total2, 10);
  })
);
```

#### API Endpoint Fuzzing

**MANDATORY** for all API endpoints:

```typescript
import { fuzzEndpoint, fuzzSchemaValidation } from '@ai-fastify-template/types';

describe('API Fuzzing Tests', () => {
  it('should handle malicious inputs safely', async () => {
    await fuzzEndpoint(app, 'POST', '/users', {
      iterations: 100,
      expectedSuccessStatuses: [200, 201],
      expectedErrorStatuses: [400, 422, 429],
    });
  });

  it('should validate schema properly', async () => {
    const validPayload = { email: 'test@example.com', name: 'Test' };
    await fuzzSchemaValidation(app, 'POST', '/users', validPayload);
  });
});
```

#### Model-Based Testing for Stateful Systems

For complex stateful systems (shopping carts, user sessions, etc.):

```typescript
import {
  shoppingCartStateMachine,
  runModelBasedTest,
  AddItemCommand,
  RemoveItemCommand,
} from '@ai-fastify-template/types';

describe('Shopping Cart State Machine', () => {
  it('should maintain consistency across operations', async () => {
    await runModelBasedTest(
      shoppingCartStateMachine(() => new ShoppingCart()),
      { maxCommands: 50, iterations: 20 }
    );
  });
});
```

#### Property Test Templates

Use pre-built templates for common patterns:

```typescript
import {
  testInvariants,
  testMonotonicity,
  testIdempotency,
  invariants,
} from '@ai-fastify-template/types';

// Template for financial calculations
testInvariants(fc.array(itemRecord()), calculateTotal, [
  invariants.nonNegative,
  invariants.finite,
  invariants.zeroForEmpty,
  invariants.boundedBySum,
]);

// Template for monotonic functions
testMonotonicity(
  fc.tuple(fc.float({ min: 0, max: 100 }), fc.float({ min: 0, max: 100 })),
  ([a, b]) => [Math.min(a, b), Math.max(a, b)],
  discountPercent => calculateDiscount(100, discountPercent)
);
```

#### Required Property Test Structure

Every business logic function MUST have:

1. **Invariant tests** - Properties that always hold
2. **Boundary value tests** - Edge cases with fast-check generators
3. **Composition tests** - Function interaction properties
4. **Error condition tests** - Invalid input handling

```typescript
describe('BusinessFunction - Properties', () => {
  describe('Invariants', () => {
    it('should maintain mathematical properties', () => {
      // fc.assert with mathematical invariants
    });
  });

  describe('Boundary Values', () => {
    it('should handle edge cases correctly', () => {
      // fc.assert with boundary value generators
    });
  });

  describe('Composition', () => {
    it('should compose correctly with other functions', () => {
      // testComposition or manual composition tests
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid inputs gracefully', () => {
      // fc.assert with invalid input generators
    });
  });
});
```

#### Property Test Quality Standards

**Minimum Requirements:**

- **1000+ test cases per property** (fast-check default)
- **Coverage of all input domains** using appropriate generators
- **Mathematical rigor** - precise invariant specifications
- **Integration with mutation testing** - properties must kill mutants

**Generator Quality:**

```typescript
// ❌ Poor: Too narrow, misses edge cases
fc.integer({ min: 1, max: 10 });

// ✅ Good: Comprehensive range with edge cases
fc.oneof(
  fc.constant(0),
  fc.integer({ min: 1, max: 100 }),
  fc.integer({ min: 1000, max: Number.MAX_SAFE_INTEGER })
);
```

**Invariant Quality:**

```typescript
// ❌ Weak: Doesn't verify business logic
expect(result).toBeDefined();

// ✅ Strong: Verifies mathematical relationship
expect(result).toBe(
  input.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
```

## Common Patterns & Examples

### Route Structure Template

```typescript
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const RequestSchema = z.object({
  // Define request schema
});

const ResponseSchema = z.object({
  // Define response schema
});

const routes: FastifyPluginAsync = async fastify => {
  fastify.post(
    '/endpoint',
    {
      schema: {
        body: RequestSchema,
        response: { 201: ResponseSchema },
      },
    },
    async (request, reply) => {
      try {
        const data = RequestSchema.parse(request.body);
        const result = await fastify.service.operation(data);
        return reply.code(201).send(result);
      } catch (error) {
        fastify.log.error({ error }, 'Operation failed');
        throw error; // Let Fastify handle error response
      }
    }
  );
};

export default routes;
```

### Service Layer Template

```typescript
export interface ServiceInterface {
  operation(data: InputType): Promise<OutputType>;
}

export class ServiceImplementation implements ServiceInterface {
  constructor(
    private readonly db: DatabaseClient,
    private readonly logger: Logger
  ) {}

  async operation(data: InputType): Promise<OutputType> {
    this.logger.info({ data: sanitizedData }, 'Starting operation');

    try {
      const result = await this.db.collection.operation(data);
      this.logger.info({ resultId: result.id }, 'Operation completed');
      return result;
    } catch (error) {
      this.logger.error({ error, data: sanitizedData }, 'Operation failed');
      throw error;
    }
  }
}
```

### Plugin Registration Template

```typescript
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    serviceName: ServiceInterface;
  }
}

export default fp(
  async fastify => {
    const service = new ServiceImplementation(fastify.db, fastify.log);

    fastify.decorate('serviceName', service);
  },
  {
    name: 'service-name',
    dependencies: ['database'], // List plugin dependencies
  }
);
```

### Environment Configuration Template

```typescript
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(): Env {
  try {
    return EnvSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment configuration:', error);
    process.exit(1);
  }
}
```

## Project Management Integration

### Linear MCP Integration

**🚨 CRITICAL: Project Assignment Rules**

1. **Never create orphaned issues** - Always include `projectId` when creating issues
2. **Maintain consistency** - All issues for this repository should use the same project
3. **Fail safely** - If you can't determine the project, ask rather than guess

#### Creating Issues

```typescript
// ✅ CORRECT: Always specify projectId
mcp__linear__create_issue({
  teamId: '...',
  projectId: '...', // REQUIRED - determine from context
  title: '...',
  description: '...',
});

// ❌ WRONG: Missing projectId creates orphaned issues
mcp__linear__create_issue({
  teamId: '...',
  title: '...',
  // No projectId!
});
```

#### How to Determine the Correct Project

- Check for existing Linear issues in the codebase (commits, PRs, comments)
- If found, query one to get its `projectId` and use the same project
- If none found, list available projects and select the most appropriate one
- When uncertain, ask which project to use

#### Standard Workflow

- **Issue management**: Use `mcp__linear__create_issue` and `mcp__linear__update_issue`
- **Branch naming**: Create branches that reference Linear issue IDs
- **Progress tracking**: Update Linear issues as development progresses
- **PR linking**: Always reference Linear issues in PR descriptions

```bash
# Example workflow with Linear
# 1. Create or update Linear issue (with correct project!)
# 2. Create branch with issue reference
git checkout -b feature/LIN-123-user-authentication

# 3. During development, update Linear issue status
# 4. In PR description, reference: "Closes LIN-123"
```

### GitHub CLI Integration

- **PR creation**: Use `gh pr create` with proper templates
- **Issue management**: Use `gh issue list` and `gh issue create`
- **Repository operations**: Use `gh` commands for GitHub operations

```bash
# Create PR with proper formatting
gh pr create --title "feat(auth): implement user authentication (LIN-123)" \
             --body "## Summary\n- Add user authentication\n- Implement JWT tokens\n\n## Testing\n- Unit tests added\n- Integration tests updated\n\nCloses LIN-123"
```

### Commit and PR Standards

- **Commit format**: Follow Conventional Commits: `type(scope): description`
- **PR titles**: Include Linear issue reference
- **PR descriptions**: Use template with Summary, Testing, and issue links
- **Code review**: All PRs require review and passing CI

## Quality Pipeline Integration

### ESLint + Prettier (Formatting & Runtime Safety)

- **Automatic formatting**: 2-space indentation, consistent style via Prettier
- **Runtime safety focus**: ~40 lines of rules for what TypeScript can't catch
- **Architectural patterns**: Environment validation, request validation, error handling
- **Minimal configuration**: Leverages TypeScript's built-in safety features

### TypeScript (Maximum Safety via @tsconfig/strictest)

- **@tsconfig/strictest preset**: Community-maintained preset with all safety flags
- **Beyond strict mode**: Includes `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.
- **Zero configuration**: Inherit from preset, add only project-specific paths

### Architectural Pattern Enforcement (via ESLint)

- **Environment access**: Must use validated environment schemas (no direct process.env)
- **Route validation**: All request.body usage requires Zod schemas
- **Error handling**: Routes must use Fastify error patterns (no generic Error throws)
- **Service patterns**: Business logic must be in service layer with dependency injection
- **Plugin patterns**: Fastify plugins must use fastify-plugin wrapper

### Git Hooks (Husky + lint-staged)

- **Pre-commit automation**: Husky + lint-staged automatically processes staged files
- **ESLint + Prettier**: Auto-fixes formatting and linting issues before commit
- **Zero staging issues**: Modified files are automatically re-staged after fixes
- **Industry standard**: Uses widely-adopted tools without custom scripts

### Security & Dependencies

- **Security audits**: Regular `pnpm audit` checks for vulnerabilities
- **Dependency validation**: Ensure no unused or outdated dependencies
- **Bundle analysis**: Monitor bundle size and dependency health

## AI Agent Workflow

### Development Process

1. **Start with Linear issue**: Create or reference existing Linear issue
2. **Create feature branch**: Use `git checkout -b feature/LIN-XXX-description`
3. **Quick validation**: Run `pnpm ai:quick` frequently during development
4. **Pre-commit check**: Run `pnpm ai:check` before committing
5. **PR preparation**: Run `pnpm ai:compliance` before creating PR
6. **Use tools**: Leverage Linear MCP and GitHub CLI for project management

### Code Review Checklist

- [ ] All quality checks pass (`pnpm ai:compliance`)
- [ ] Tests added for new functionality
- [ ] Documentation updated (if needed)
- [ ] No security vulnerabilities introduced
- [ ] Linear issue properly referenced
- [ ] Error handling follows Fastify patterns
- [ ] Input validation uses Zod schemas

### Common AI Pitfalls to Avoid

- **Skipping validation**: Always include Zod schemas for inputs
- **Generic errors**: Use specific error types and Fastify patterns
- **Direct env access**: Use validated environment configuration
- **Missing tests**: Include both unit and integration tests
- **Type shortcuts**: Avoid `any` types, use proper TypeScript

## Troubleshooting & Debugging

### Quality Check Failures

```bash
# If ai:quick fails
pnpm lint:fix          # Auto-fix formatting issues
pnpm type-check        # Check TypeScript errors

# If ai:check fails (less common now)
pnpm lint              # Check ESLint rule violations

# If ai:compliance fails
pnpm test              # Run failing tests
pnpm build             # Check build issues
```

### Common Issues

- **TypeScript errors**: Check for missing types, incorrect imports
- **Validation failures**: Ensure Zod schemas match TypeScript interfaces
- **Test failures**: Verify mocks and test data setup
- **Build errors**: Check for circular dependencies and import issues

### Getting Help

1. **Check pipeline output**: Look at specific error messages
2. **Reference existing patterns**: Find similar implementations in codebase
3. **Run individual checks**: Isolate the failing component
4. **Use debugging tools**: Leverage TypeScript and test debugging

## Success Metrics

**Code Quality Indicators**:

- ✅ All TypeScript strict mode checks pass
- ✅ All Zod validations in place
- ✅ No circular dependencies
- ✅ High test coverage with meaningful validation
- ✅ Proper error handling with status codes
- ✅ Clean separation of concerns

**Development Velocity Indicators**:

- ✅ `pnpm ai:quick` provides near-instant feedback
- ✅ `pnpm ai:check` completes rapidly for iterative development
- ✅ High first-time PR success rate
- ✅ Minimal review iterations needed

Remember: These guidelines exist to help AI agents generate high-quality, maintainable code that integrates seamlessly with the project's architecture and passes all quality gates on the first try.
