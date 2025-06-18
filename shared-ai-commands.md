# Development Commands

## Core Development
```bash
# Start development server
pnpm dev                    # Start all apps in development mode

# Build and verification
pnpm build                  # Build all packages
pnpm test                   # Run all test suites
pnpm test:watch             # Run tests in watch mode
pnpm type-check             # TypeScript compilation check
```

## Quality Assurance (backend-api specific)
```bash
cd apps/backend-api
pnpm lint                   # Biome linting and formatting
pnpm test:coverage          # Run tests with coverage
pnpm clean                  # Clean build artifacts
```

## Single Test Execution
```bash
# Run specific test file
cd apps/backend-api
pnpm vitest src/path/to/test.test.ts

# Run tests matching pattern
pnpm vitest --run --reporter=verbose "pattern"
```

## Pre-Commit Workflow
Always run these commands before committing:
```bash
pnpm type-check            # Verify TypeScript compilation
pnpm lint                  # Check formatting and linting
pnpm test                  # Run all tests
pnpm build                 # Verify build succeeds
```