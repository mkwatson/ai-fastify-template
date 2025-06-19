# AI Fastify Template

A TypeScript Fastify starter template with built-in AI coding assistant optimization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

## What This Is

A Fastify + TypeScript monorepo starter that includes:

- **Proper environment validation** with Zod (not just fastify-env)
- **Comprehensive test setup** with Vitest and 95%+ coverage
- **AI coding assistant optimization** that actually works
- **Modern tooling** (Biome, pnpm workspaces, TurboRepo)
- **Production-ready patterns** without over-engineering

This is what you get when you combine solid engineering practices with innovative AI guidance systems.

## Quick Start

```bash
git clone https://github.com/mkwatson/ai-fastify-template.git
cd ai-fastify-template
pnpm install
pnpm dev
```

Your API runs at `http://localhost:3000`. The `/example` endpoint shows you how everything works.

## Why This Template

### The Environment Validation Problem

Most Node.js projects use `dotenv` and hope for the best. This template uses Zod for runtime validation:

```typescript
// ❌ Traditional approach
const PORT = process.env.PORT || 3000;  // Could be undefined, string, anything

// ✅ This template
const config = envSchema.parse(process.env);
// config.PORT is guaranteed to be a number between 1-65535
```

If your environment is misconfigured, the app fails fast at startup with clear error messages.

### The AI Coding Assistant Problem

AI coding assistants (Cursor, Claude, Copilot) are powerful but don't understand your project structure. They suggest inconsistent patterns and make assumptions.

This template includes an AI guidance system that teaches assistants your exact architecture:

```
.cursor/rules/          # Cursor-specific context
CLAUDE.md               # Claude session memory  
shared-ai-core.md       # Core patterns
docs/AI_GUIDELINES.md   # Comprehensive guide
```

**Result**: AI assistants generate code that matches your project patterns instead of generic boilerplate.

## Architecture

### Stack

- **Fastify 5** - Fast, TypeScript-native web framework
- **Zod** - Runtime validation with type inference
- **Vitest** - Modern testing with coverage
- **Biome** - Fast formatting and linting
- **pnpm workspaces** - Efficient dependency management
- **TurboRepo** - Build caching and task orchestration

### Structure

```
apps/backend-api/       # Main Fastify application
├── src/
│   ├── plugins/        # Environment, utilities
│   ├── routes/         # API endpoints
│   └── app.ts          # App configuration
└── test/               # Comprehensive test suite

packages/               # Shared libraries (when you need them)
docs/                   # Architecture guides
scripts/                # Build automation
```

## Features

### Environment Configuration

Runtime validation ensures your app starts correctly:

```typescript
// Required environment variables
NODE_ENV: 'development' | 'production' | 'test'
PORT: number (1-65535)
HOST: string
LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
```

Missing or invalid values cause startup failure with clear error messages.

### Testing

- **18 test cases** covering validation, plugins, routes, and error handling
- **95.31% statement coverage** with detailed reporting
- **Type-safe test utilities** and mocking
- **Fast test execution** with Vitest

### Development Experience

```bash
pnpm dev              # Development server with hot reload
pnpm test             # Run test suite
pnpm test:watch       # Tests in watch mode
pnpm test:coverage    # Coverage reporting
pnpm build            # Production build
pnpm lint             # Check code quality
pnpm lint:fix         # Auto-fix issues
```

### AI Guidance System

The most innovative part of this template. AI coding assistants learn:

- **Project structure** and naming conventions
- **TypeScript patterns** and strict mode requirements
- **Testing strategies** and coverage expectations
- **Error handling** and validation patterns
- **Git workflow** and commit conventions

This isn't marketing - it's a measurable improvement in AI-assisted development quality.

## What's Actually Implemented

✅ **Fastify app** with TypeScript and plugins  
✅ **Environment validation** with Zod schemas  
✅ **Comprehensive testing** with 95%+ coverage  
✅ **Modern tooling** (Biome, pnpm, TurboRepo)  
✅ **AI guidance system** with multi-tool optimization  
✅ **Production build** pipeline  

## What's Planned

- GitHub Actions CI/CD pipeline
- OpenAPI documentation generation
- Rate limiting and CORS middleware
- Database integration patterns
- Authentication/authorization examples
- Docker containerization
- Deployment configurations

## Contributing

This is a starter template, not a framework. Fork it, modify it, make it yours.

If you improve the AI guidance system or find better patterns, PRs are welcome.

## License

MIT - Use it however you want. 