# AI Coding Guidelines for ai-fastify-template

## 🚨 CRITICAL: Zero CI Failures Guaranteed

**Three-Layer Defense System** prevents any CI failures:

1. **During Development**:
   - Manual: `pnpm ai:quick` (run frequently, <5s)
   - Automatic: `pnpm ai:watch` (continuous validation on file save)
2. **Before Commit**: Pre-commit hooks (automatic, ~30s)
3. **Before Push**: Pre-push validation (mandatory, matches CI exactly)

**You CANNOT push code that will fail CI** - the pre-push hook runs full validation.

**Development validation pipeline:**

```bash
# Manual validation
pnpm ai:quick          # Fast feedback during coding (~5s): lint + type-check (Nx cached)
pnpm ai:check          # Standard validation (~30s): + graph validation
pnpm ai:compliance     # Full validation (~3min): + tests + build + mutation testing + security
pnpm ai:mutation       # Run mutation testing directly (focused on business logic)

# Continuous validation (runs on file save)
pnpm ai:watch          # Watch all files, run ai:quick on changes
pnpm dev:watch         # Watch all files, run affected lint+type-check

# Nx affected commands - only run on changed packages
pnpm affected:lint     # Lint only changed packages
pnpm affected:test     # Test only changed packages
pnpm affected:build    # Build only changed packages
pnpm affected:all      # Run all tasks on changed packages
```

**Fix issues immediately:**

```bash
pnpm lint:fix          # Auto-fix formatting and linting
```

**Key Rule**: The pre-push hook automatically runs `pnpm ci:check` - you literally cannot push failing code.

## Quick Start Essentials

**Tech Stack**: Fastify + TypeScript + Zod + Nx monorepo with comprehensive quality guardrails

**Project Structure**:

- `apps/backend-api/` - Main Fastify API server
- `packages/` - Shared libraries and utilities

**Essential Development Flow**:

```bash
# One-time setup (for pre-push validation)
pnpm setup:hooks       # Installs both pre-commit and pre-push hooks

# Start feature
git checkout main && git pull origin main
git checkout -b feature/your-feature-name

# Develop with instant feedback
pnpm ai:quick          # Run constantly during coding (Nx cached for speed)

# Commit (pre-commit hooks run automatically)
git add . && git commit -m "feat(scope): description"

# Push (pre-push validation runs automatically)
git push               # Will run full CI validation before push
```

**If Validation Fails During Push:**

```bash
# The push will be blocked with clear error messages
# Fix the issues locally:
pnpm lint:fix          # Auto-fix formatting
pnpm type-check        # See TypeScript errors
pnpm test              # Run failing tests

# Then commit fixes and push again
git add . && git commit -m "fix: resolve validation errors"
git push               # Pre-push will run again
```

## 🚨 MANDATORY Architecture Rules

### TypeScript: @tsconfig/strictest Preset

- **No `any` types** - Use specific types or `unknown` with type guards
- **Explicit return types** - For all public functions and methods
- **Strict null checks** - Handle `null` and `undefined` explicitly

```typescript
// ✅ Good: Explicit types and safety
function createUser(data: CreateUserRequest): Promise<User> {
  // Implementation with proper error handling
}

// ❌ Bad: Unsafe patterns
function createUser(data: any): any {
  // Unsafe implementation
}
```

### Zod Validation: MANDATORY for All Inputs

- **All inputs validated** - Request bodies, query params, environment variables
- **ESLint enforces** - No direct `process.env` access or unvalidated requests

```typescript
// ✅ Good: Zod schema with validation
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

// Route with validation
fastify.post(
  '/users',
  {
    schema: { body: CreateUserSchema },
  },
  async (request, reply) => {
    const userData = CreateUserSchema.parse(request.body);
  }
);

// ❌ Bad: Unvalidated input
fastify.post('/users', async req => {
  const data = req.body; // ESLint error
});
```

### Error Handling: Fastify Patterns Only

```typescript
// ✅ Good: Fastify error handling
if (!user) {
  throw fastify.httpErrors.notFound('User not found');
}

// ❌ Bad: Generic error throwing
throw new Error('Something went wrong'); // Too generic!
```

## Code Templates

### Route Template

```typescript
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const RequestSchema = z.object({
  // Define request schema
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
      const data = RequestSchema.parse(request.body);
      const result = await fastify.service.operation(data);
      return reply.code(201).send(result);
    }
  );
};

export default routes;
```

### Service Layer Template

```typescript
export class ServiceImplementation {
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
});

export const env = EnvSchema.parse(process.env);
```

## 🚨 CRITICAL: Mutation Testing Gate (AI-Only Development)

**Required for All PRs** - 85% mutation score threshold on business logic

**Targeted Scope** (High-ROI only):

- **Enforced**: `apps/backend-api/src/utils/` - calculations, validators, formatters
- **Excluded**: Framework code, configuration, routes, plugins

**Execution**:

- **Local**: `pnpm ai:compliance` includes mutation testing
- **CI/CD**: Automatically runs on every PR with config validation
- **Direct**: `pnpm ai:mutation` to run standalone
- **Verify Config**: `pnpm test:config:verify` uses Nx to validate both configs produce identical results

**Why It's Required**: AI-generated tests often achieve 100% coverage without validating logic. Mutation testing is the only reliable gate against coverage theater in AI-only development.

**⚠️ Implementation Note**:
Mutation testing uses a separate `vitest.mutation.config.ts` that disables workspace mode due to Stryker's incompatibility with Vitest workspaces. This config directly includes test files and maintains the same module resolution as the main test setup. When Stryker adds workspace support, we can remove this workaround.

## 🚨 CRITICAL: Testing Anti-Patterns

**The goal is not coverage, it's confidence.** Tests that don't fail when logic is broken are worse than no tests.

### AI Testing Anti-Patterns to Avoid

```typescript
// ❌ BAD: Coverage theater - achieves coverage but tests nothing
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

### Test Quality Checklist

- [ ] **Does the test fail when the business logic is broken?**
- [ ] **Would this test catch common production bugs?**
- [ ] **Are all edge cases covered?** (null, undefined, empty, boundary values)
- [ ] **Do integration tests verify complete workflows?**

### Testing Requirements

- **Unit tests**: For all business logic and utility functions
- **Integration tests**: For all API routes - full CRUD workflows
- **Edge cases MANDATORY**: Every function MUST test null, undefined, empty, boundary values
- **Property-based testing**: Use fast-check for business logic functions (ESLint enforced)

## AI Agent Workflow

### Development Process

1. **Run validation constantly**: `pnpm ai:quick` during development
2. **Before every commit**: `pnpm ci:check` (MUST pass)
3. **Before pushing**: Git pre-push hook runs `pnpm pre-push` automatically
   - Validates test configurations match
   - Ensures mutation testing will work in CI
4. **Before PR submission**: `pnpm ai:compliance` (includes mutation testing gate)
5. **Create proper branches**: `git checkout -b feature/LIN-XXX-description`
6. **Conventional commits**: `feat(scope): description`
7. **Quality gates**: ALL checks must pass including 85% mutation score on utils/

### Local Validation Commands

- `pnpm test:config:quick` - Fast validation of test configs (utils only)
- `pnpm test:config:verify` - Full validation using Nx (all tests)
- `pnpm pre-push` - Complete pre-push validation suite

### Linear MCP Integration Rules

**🚨 CRITICAL: Always include `projectId` when creating issues**

```typescript
// ✅ CORRECT: Always specify projectId
mcp__linear__create_issue({
  teamId: '...',
  projectId: '...', // REQUIRED - determine from context
  title: '...',
  description: '...',
});

// ❌ WRONG: Missing projectId creates orphaned issues
```

### GitHub CLI Integration

```bash
# Create PR with proper formatting
gh pr create --title "feat(auth): implement user authentication (LIN-123)" \
             --body "## Summary\n- Add user authentication\n\n## Testing\n- Unit tests added\n\nCloses LIN-123"
```

## ESLint Runtime Safety Rules

Our ESLint is **minimal** (~40 lines) and focused on runtime safety that TypeScript can't catch:

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

## Monorepo Structure Rules

- **Apps → Packages**: ✅ Apps can depend on packages
- **Packages → Packages**: ✅ Packages can depend on other packages
- **Apps → Apps**: ❌ Apps cannot depend on other apps
- **Packages → Apps**: ❌ Packages cannot depend on apps

## Branded Types (Enterprise ID Safety)

Prevent ID mixups at compile time:

```typescript
import { UserId, OrderId, ZodBrandedSchemas } from '@ai-fastify-template/types';

// ✅ Type-safe ID creation
const userId = UserId('550e8400-e29b-41d4-a716-446655440000');
const orderId = OrderId('660e8400-e29b-41d4-a716-446655440000');

// ❌ Compile error: Cannot mix ID types
processOrder(userId); // TypeScript Error

// ✅ Zod integration for routes
const GetUserParams = z.object({
  userId: ZodBrandedSchemas.UserId,
});
```

## Troubleshooting Common Issues

### Quality Check Failures

```bash
# If ci:check fails
pnpm lint:fix          # Auto-fix formatting issues
pnpm type-check        # Check TypeScript errors
pnpm test              # Run failing tests
pnpm build             # Check build issues
```

### TypeScript Errors

- Check for missing types, incorrect imports
- Ensure Zod schemas match TypeScript interfaces
- Verify no `any` types are used

### Test Failures

- Verify mocks and test data setup
- Ensure tests validate business logic, not just coverage
- Check edge cases are covered

### Build Errors

- Check for circular dependencies: `pnpm graph:validate`
- Verify import/export statements

## Success Metrics

**First-Try Success Indicators**:

- ✅ `pnpm ci:check` passes immediately
- ✅ All TypeScript strict mode checks pass
- ✅ All Zod validations in place
- ✅ Tests validate business logic (not just coverage)
- ✅ Proper error handling with Fastify patterns
- ✅ Clean separation of concerns

Remember: These guidelines exist to help AI agents generate high-quality, maintainable code that passes all quality gates on the first try (or at least minimize the number of iterations to pass all quality gates).
