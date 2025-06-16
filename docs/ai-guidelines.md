# AI Development Guidelines

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