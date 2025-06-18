# AI Core Standards

## Architecture Principles

- **Strict TypeScript**: No `any` types allowed - use proper type definitions
- **Runtime Validation**: Use Zod for all validation (env, request bodies, responses)
- **Clean Architecture**: Keep routes thin - business logic goes in services
- **Dependency Rules**: Services should not import from routes or plugins
- **Testability**: Use dependency injection patterns for testability

## Code Standards

### TypeScript
- **Strict mode** enabled with `noExplicitAny: "error"`
- All functions must have explicit return types
- Handle null/undefined cases explicitly
- Use `Record<string, never>` for empty object types

### Validation Pattern
```typescript
// Always use Zod for runtime validation
const Schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

type RequestData = z.infer<typeof Schema>;
```

### Fastify Route Pattern
```typescript
// Standard route structure
const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/endpoint', {
    schema: {
      body: RequestSchema,
      response: { 201: ResponseSchema }
    }
  }, async (request, reply) => {
    const data = RequestSchema.parse(request.body);
    // Implementation
  });
};
```

## Error Handling
- Use custom error classes with proper types
- Always handle Zod validation errors gracefully
- Return consistent error response format
- Use appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 422, 500)
- Never expose internal error details to clients

## File Organization
- **Routes**: `src/routes/` - HTTP handlers only
- **Services**: `src/services/` - Business logic
- **Plugins**: `src/plugins/` - Fastify plugins
- **Types**: `src/types/` - Shared TypeScript types
- **Utils**: `src/utils/` - Pure utility functions

## Testing Requirements
- Write unit tests for all business logic
- Write integration tests for all routes
- Aim for >90% test coverage
- Mock external dependencies in tests
- Test both success and error cases
- Use Vitest with `describe/it/expect` pattern

## Quality Gates
Before committing changes, ensure:
1. `pnpm type-check` passes (no TypeScript errors)
2. `pnpm lint` passes (Biome formatting/linting)
3. `pnpm test` passes (all tests)
4. `pnpm build` succeeds

## Critical Rules
- **NEVER** access `process.env` directly - use validated env schema
- **NEVER** skip input validation on any public endpoint
- **NEVER** use `fastify.register()` without proper encapsulation
- **NEVER** mix async/await with callbacks
- **ALWAYS** handle stream cleanup in SSE endpoints
- **ALWAYS** validate all user inputs with Zod schemas
- **ALWAYS** implement proper logging with structured data