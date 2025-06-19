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
fastify.post('/users', {
  schema: {
    body: CreateUserSchema,
    response: { 201: UserResponseSchema }
  }
}, async (request, reply) => {
  const userData = CreateUserSchema.parse(request.body);
  // Safe to use userData with full type safety
});
```

### Fastify Architectural Patterns
- **Thin routes**: Keep HTTP concerns separate from business logic
- **Plugin architecture**: Use Fastify plugins for modular functionality
- **Service layer**: Business logic in dedicated service classes
- **Dependency injection**: Services receive dependencies via constructor

```typescript
// ✅ Good: Thin route with service delegation
fastify.post('/users', {
  schema: { body: CreateUserSchema }
}, async (request, reply) => {
  const user = await fastify.userService.createUser(request.body);
  return reply.code(201).send(user);
});

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

## Testing & Validation Standards

### Quality Pipeline Commands
```bash
# Layer 1: Fast feedback (<5 sec)
pnpm ai:quick          # lint + type-check

# Layer 2: Standard validation (<30 sec)  
pnpm ai:check          # ai:quick + security

# Layer 3: Full validation
pnpm ai:compliance     # ai:check + tests + build

# Individual checks
pnpm lint              # ESLint + Prettier formatting and linting
pnpm type-check        # TypeScript compilation
pnpm test              # Unit and integration tests
pnpm build             # Production build verification
```

### Testing Requirements
- **Unit tests**: For all business logic and services
- **Integration tests**: For all API routes and external integrations
- **Test coverage**: Maintain >90% line coverage
- **Test structure**: Arrange-Act-Assert pattern with descriptive names

```typescript
// ✅ Good: Comprehensive test structure
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };
      const mockDb = createMockDatabase();
      const service = new UserService(mockDb, mockLogger);

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(result).toMatchObject(userData);
      expect(mockDb.users.create).toHaveBeenCalledWith(
        expect.objectContaining(userData)
      );
    });

    it('should throw error for duplicate email', async () => {
      // Test error cases
    });
  });
});
```

### Mutation Testing (When Available)
- **Mutation score**: Target >90% mutation test coverage
- **Logic validation**: Ensure tests actually validate business logic
- **Edge case coverage**: Tests should catch subtle bugs

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

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/endpoint', {
    schema: {
      body: RequestSchema,
      response: { 201: ResponseSchema }
    }
  }, async (request, reply) => {
    try {
      const data = RequestSchema.parse(request.body);
      const result = await fastify.service.operation(data);
      return reply.code(201).send(result);
    } catch (error) {
      fastify.log.error({ error }, 'Operation failed');
      throw error; // Let Fastify handle error response
    }
  });
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

export default fp(async (fastify) => {
  const service = new ServiceImplementation(
    fastify.db,
    fastify.log
  );

  fastify.decorate('serviceName', service);
}, {
  name: 'service-name',
  dependencies: ['database'], // List plugin dependencies
});
```

### Environment Configuration Template
```typescript
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
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