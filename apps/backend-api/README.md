# Backend API - Fastify TypeScript Service

Production-ready Fastify backend with TypeScript, Zod validation, and comprehensive environment configuration.

## Quick Start

```bash
# Copy environment configuration
cp .env.example .env

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
```

The API will be available at [http://localhost:3000](http://localhost:3000)

## Environment Configuration

All environment variables are validated using Zod schemas for type safety and runtime validation.

### Required Variables

| Variable         | Description                         | Format   | Example               |
| ---------------- | ----------------------------------- | -------- | --------------------- |
| `OPENAI_API_KEY` | OpenAI API key for AI functionality | `sk-...` | `sk-1234567890abcdef` |

### Optional Variables with Defaults

| Variable                 | Description                                    | Default                 | Valid Values                                       |
| ------------------------ | ---------------------------------------------- | ----------------------- | -------------------------------------------------- |
| `NODE_ENV`               | Application environment                        | `development`           | `development`, `production`, `test`                |
| `PORT`                   | Server port                                    | `3000`                  | 1-65535                                            |
| `HOST`                   | Server host                                    | `localhost`             | Any valid hostname                                 |
| `LOG_LEVEL`              | Logging verbosity                              | `info`                  | `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| `JWT_SECRET`             | Secret for JWT signing (auto-generated in dev) | Auto-generated          | Min 32 characters                                  |
| `ALLOWED_ORIGIN`         | CORS allowed origins (comma-separated)         | `http://localhost:5173` | Valid HTTP(S) URLs                                 |
| `SYSTEM_PROMPT`          | Custom AI system prompt                        | `""` (empty)            | Any string                                         |
| `RATE_LIMIT_MAX`         | Max requests per window                        | `60`                    | Positive integer                                   |
| `RATE_LIMIT_TIME_WINDOW` | Rate limit window (ms)                         | `60000` (1 minute)      | Positive integer (milliseconds)                    |

### Security Notes

- **JWT_SECRET**:
  - Automatically generated in development mode if not provided
  - **REQUIRED** in production - generate with: `openssl rand -hex 32`
  - Must be at least 32 characters for security
- **Sensitive Values**:
  - All sensitive environment variables (API keys, secrets) are automatically redacted in logs
  - Never commit `.env` files to version control

### Multiple Origins Example

```bash
# Single origin
ALLOWED_ORIGIN=https://example.com

# Multiple origins (comma-separated)
ALLOWED_ORIGIN=https://example.com,https://app.example.com,http://localhost:3000
```

### Rate Limiting Examples

```bash
# 60 requests per minute (default)
RATE_LIMIT_MAX=60
RATE_LIMIT_TIME_WINDOW=60000

# 100 requests per 5 minutes
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=300000

# 1000 requests per hour
RATE_LIMIT_MAX=1000
RATE_LIMIT_TIME_WINDOW=3600000
```

### Migration Guide

If you're upgrading from a previous version:

1. **New Required Variables**:
   - `OPENAI_API_KEY` is now required - obtain from [OpenAI Platform](https://platform.openai.com/api-keys)

2. **Changed Defaults**:
   - `RATE_LIMIT_TIME_WINDOW` default changed from 100000ms to 60000ms (1 minute)
   - Adjust your configuration if you relied on the old default

3. **Production Requirements**:
   - `JWT_SECRET` is now enforced in production environments
   - Generate a secure secret: `openssl rand -hex 32`

4. **Validation Changes**:
   - All environment variables now have strict validation
   - Check logs for validation errors on startup

## Available Scripts

```bash
# Development
pnpm dev              # Start with hot reload
pnpm dev:debug        # Start with Node.js inspector

# Production
pnpm start            # Start production server
pnpm build            # Build for production

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests only
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report

# Code Quality
pnpm lint             # ESLint + Prettier check
pnpm lint:fix         # Auto-fix linting issues
pnpm type-check       # TypeScript compilation check

# OpenAPI
pnpm openapi:generate # Generate OpenAPI spec
```

## Project Structure

```
backend-api/
├── src/
│   ├── app.ts           # Fastify app factory
│   ├── server.ts        # Server entry point
│   ├── plugins/         # Fastify plugins
│   │   ├── env.ts       # Environment configuration
│   │   ├── sensible.ts  # Common utilities
│   │   ├── support.ts   # Request/reply decorators
│   │   └── swagger.ts   # API documentation
│   ├── routes/          # API routes
│   │   └── root.ts      # Health check endpoint
│   └── utils/           # Business logic utilities
├── test/                # Test suites
├── openapi.json         # Generated API spec
└── package.json         # Dependencies
```

## Key Features

- **Type Safety**: Full TypeScript with @tsconfig/strictest preset
- **Validation**: Zod schemas for all inputs and environment variables
- **Security**: Automatic redaction of sensitive values in logs
- **Documentation**: Auto-generated OpenAPI specification
- **Testing**: Comprehensive test suite with mutation testing
- **Developer Experience**: Hot reload, detailed error messages

## API Documentation

When running in development, Swagger UI is available at:

- http://localhost:3000/documentation

OpenAPI specification is automatically generated and available at:

- http://localhost:3000/documentation/json

## Error Handling

The API uses Fastify's built-in error handling with custom error messages:

```typescript
// 400 Bad Request - Invalid input
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error details"
}

// 404 Not Found
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Resource not found"
}

// 500 Internal Server Error
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## Health Check

```bash
curl http://localhost:3000/health

# Response
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Learn More

- [Fastify Documentation](https://fastify.dev/docs/latest/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
