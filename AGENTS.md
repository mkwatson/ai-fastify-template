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
pnpm ai:check          # Standard validation (includes patterns)
pnpm ai:compliance     # Full compliance validation
pnpm build             # Production build
pnpm test              # Run all tests
```

## Development Environment

**Required Tools**:

- Node.js >= 18.0.0
- pnpm >= 8.0.0
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

- **No `any` types**: Use specific types or `unknown` with type guards
- **Explicit return types**: For all public functions and methods
- **Strict null checks**: Handle `null` and `undefined` explicitly
- **No implicit returns**: All code paths must return values

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
pnpm ai:check          # ai:quick + security

# Layer 3: Full validation
pnpm ai:compliance     # ai:check + tests + mutation testing + build

# Individual checks
pnpm lint              # ESLint + Prettier with comprehensive AI-safety rules
pnpm type-check        # TypeScript compilation
pnpm test              # Unit and integration tests (Vitest)
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
pnpm test:mutation     # Mutation testing (Stryker) - 90% threshold
pnpm build             # Production build verification
```

### Enhanced Linting Rules (ESLint + Prettier)

Our ESLint configuration includes comprehensive rules specifically designed for AI coding agents:

**Advanced TypeScript Rules (Type-Aware):**

- Nullish coalescing enforcement (`@typescript-eslint/prefer-nullish-coalescing`)
- Optional chaining patterns (`@typescript-eslint/prefer-optional-chain`)
- Unnecessary condition detection (`@typescript-eslint/no-unnecessary-condition`)
- Floating promise prevention (`@typescript-eslint/no-floating-promises`)
- Readonly property enforcement (`@typescript-eslint/prefer-readonly`)

**Import Organization & Dependencies:**

- Import grouping and alphabetization
- Circular dependency detection (`import/no-cycle`)
- Duplicate import prevention (`import/no-duplicates`)

**Node.js Best Practices (eslint-plugin-n):**

- Deprecated API detection (`n/no-deprecated-api`)
- Extraneous import prevention (`n/no-extraneous-import`)
- Global preference enforcement (`n/prefer-global/process`, `n/prefer-global/console`)

**Async/Await Best Practices:**

- Promise executor validation
- Proper async/await usage patterns
- Promise handling enforcement (`promise/always-return`, `promise/catch-or-return`)

**Performance & Security:**

- Object spread over `Object.assign`
- Prevention of unsafe regex patterns
- Detection of potential object injection vulnerabilities

**Test Quality (Vitest Integration):**

- Test structure validation (`vitest/expect-expect`)
- Prevention of disabled/focused tests in CI
- Consistent test naming patterns

**Custom AI Architectural Rules:**

- No direct `process.env` access
- Required Zod validation for request bodies
- Fastify error handling patterns
- Service dependency injection enforcement
- Plugin wrapper requirements

### Testing Requirements (Vitest Framework)

- **Unit tests**: For all business logic and utility functions
- **Integration tests**: For all API routes and plugin functionality
- **Test coverage**: Maintain >80% line coverage (configured in vitest.config.ts)
- **Test structure**: Arrange-Act-Assert pattern with descriptive names
- **Test helpers**: Use shared test helpers for consistent app setup
- **Zod validation testing**: Test input validation and error cases

### Mutation Testing (Stryker) - ENTERPRISE QUALITY GATE

**Purpose**: Ensures tests actually validate business logic, not just achieve coverage metrics.

**Requirements**:
- **Minimum mutation score**: 90% (enforced in CI/CD)
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
- **Incremental improvement**: Start with 60% threshold, work up to 90%
- **No fake tests**: Don't write tests just to improve mutation scores

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

- **Mutation score**: Minimum 90% - enforced in CI
- **Purpose**: Ensure tests actually validate business logic
- **Configuration**: `stryker.config.mjs` with break threshold at 90%
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

- **Issue management**: Use `mcp__linear__create_issue` and `mcp__linear__update_issue`
- **Branch naming**: Create branches that reference Linear issue IDs
- **Progress tracking**: Update Linear issues as development progresses
- **PR linking**: Always reference Linear issues in PR descriptions

```bash
# Example workflow with Linear
# 1. Create or update Linear issue
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

### ESLint + Prettier (Formatting & Comprehensive Linting)

- **Automatic formatting**: 2-space indentation, consistent style via Prettier
- **TypeScript enforcement**: No `any` types, explicit return types, strict mode
- **Security patterns**: Comprehensive security rule enforcement
- **Custom architectural rules**: Environment access, Fastify patterns, input validation

### TypeScript (Type Safety)

- **Strict mode**: All strict TypeScript options enabled
- **No implicit any**: All types must be explicit
- **Return type enforcement**: Public functions must declare return types

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
- ✅ >90% test coverage
- ✅ Proper error handling with status codes
- ✅ Clean separation of concerns

**Development Velocity Indicators**:

- ✅ `pnpm ai:quick` completes in <5 seconds
- ✅ `pnpm ai:check` completes in <30 seconds
- ✅ First-time PR success rate >90%
- ✅ Minimal review iterations needed

Remember: These guidelines exist to help AI agents generate high-quality, maintainable code that integrates seamlessly with the project's architecture and passes all quality gates on the first try.
