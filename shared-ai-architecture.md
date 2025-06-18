# Project Architecture

## Monorepo Structure
- **apps/**: Deployable applications (currently: `backend-api`)
- **packages/**: Shared libraries (empty, planned for future)
- **pnpm workspaces** with TurboRepo for task caching and parallel execution

## Dependency Rules
- Apps can depend on packages but not other apps
- Packages can depend on other packages but not apps
- Use `@ai-fastify-template/package-name` for internal packages

## Backend API (`apps/backend-api/`)
- **Fastify 5.0** + **TypeScript** with strict configuration
- **Zod** for runtime validation (environment variables and request bodies)
- **Vitest** for testing with coverage reporting
- **Biome** for linting and formatting

## Environment Validation
The `src/plugins/env.ts` uses Zod for comprehensive environment validation:
- Type-safe configuration with custom error messages
- Sensitive data redaction for logging
- Port range validation and detailed error handling

## Important Files
- `turbo.json`: TurboRepo task configuration
- `apps/backend-api/src/plugins/env.ts`: Environment validation
- `apps/backend-api/vitest.config.ts`: Test configuration
- `biome.json`: Linting and formatting rules
- `docs/AI_GUIDELINES.md`: Comprehensive AI coding patterns

## Current Status

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed project status and roadmap.