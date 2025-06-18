# Backend API

Production-ready Fastify backend API optimized for AI-assisted development with comprehensive quality gates and enterprise patterns.

## Features

- **🚀 Fastify 5.0** - High-performance web framework
- **📝 TypeScript Strict Mode** - Maximum type safety with no `any` types
- **🔍 Zod Validation** - Runtime validation for environment variables and request bodies
- **🧪 Comprehensive Testing** - Unit and integration tests with Vitest
- **🎯 Quality Gates** - Automated linting, formatting, and type checking
- **🔧 Plugin Architecture** - Modular design with dependency injection
- **📊 Environment Validation** - Type-safe configuration with custom error messages

## Quick Start

```bash
# Development
pnpm dev                    # Start development server (http://localhost:3000)

# Testing
pnpm test                   # Run all tests
pnpm test:watch             # Run tests in watch mode
pnpm test:coverage          # Run tests with coverage report

# Quality Assurance
pnpm lint                   # Check formatting and linting
pnpm type-check             # Verify TypeScript compilation
pnpm build                  # Build for production
```

## Project Structure

```
src/
├── app.ts                  # Main application setup
├── server.ts              # Server entry point
├── plugins/               # Fastify plugins
│   ├── env.ts             # Environment validation (Zod)
│   ├── sensible.ts        # Sensible defaults
│   └── support.ts         # Utility decorators
├── routes/                # HTTP route handlers
│   ├── root.ts            # Root routes
│   └── example/           # Example API routes
└── types/                 # TypeScript type definitions

test/
├── helper.ts              # Test utilities
├── plugins/               # Plugin tests
└── routes/                # Route integration tests
```

## AI-Optimized Patterns

This backend follows specific patterns designed for AI coding assistants:

### ✅ **Route Pattern**
```typescript
const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/users', {
    schema: {
      body: CreateUserSchema,
      response: { 201: UserResponseSchema }
    }
  }, async (request, reply) => {
    const data = CreateUserSchema.parse(request.body);
    const user = await fastify.userService.create(data);
    return reply.status(201).send(user);
  });
};
```

### ✅ **Plugin Pattern**
```typescript
export default fp(async (fastify) => {
  const service = new UserService(fastify.db, fastify.log);
  fastify.decorate('userService', service);
}, {
  name: 'user-service',
  dependencies: ['database']
});
```

### ✅ **Validation Pattern**
```typescript
const Schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

type RequestData = z.infer<typeof Schema>;
```

### ✅ **Testing Pattern**
```typescript
describe('POST /users', () => {
  it('should create user with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { email: 'test@example.com', name: 'Test User' }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      email: 'test@example.com',
      name: 'Test User'
    });
  });
});
```

## Environment Configuration

The app uses Zod for comprehensive environment validation:

```typescript
// Required environment variables
NODE_ENV=development
PORT=3000
HOST=localhost
LOG_LEVEL=info

// The env plugin validates these at startup with helpful error messages
```

## Quality Gates

All code must pass these automated checks:

- ✅ **TypeScript compilation** (`pnpm type-check`)
- ✅ **Linting and formatting** (`pnpm lint`)
- ✅ **Test suite** (`pnpm test`)
- ✅ **Build process** (`pnpm build`)

## Architecture Principles

- **Routes are thin** - Only HTTP concerns
- **Services contain business logic** - Testable and reusable
- **Plugins provide functionality** - Modular and composable
- **Strict TypeScript** - No `any` types allowed
- **Runtime validation** - All inputs validated with Zod
- **Dependency injection** - Services injected via Fastify decorators

## Learning Resources

- [Fastify Documentation](https://fastify.dev/docs/latest/)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Project AI Guidelines](../../docs/AI_GUIDELINES.md)

## Development Workflow

1. **Create feature branch** from latest main
2. **Implement changes** following AI-optimized patterns
3. **Run quality gates**: `pnpm type-check && pnpm lint && pnpm test`
4. **Fix any issues** before committing
5. **Create PR** with comprehensive description

This backend is specifically designed to maximize AI coding assistant success rates while maintaining enterprise-grade quality standards.