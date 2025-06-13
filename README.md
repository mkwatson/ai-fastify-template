# 🚀 AI Fastify Template

> Production-ready Fastify + TypeScript monorepo optimized for AI-assisted development

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange)](https://pnpm.io/)

## Overview

This template provides a production-ready foundation for building **LLM-powered backend applications** with comprehensive guardrails that enable AI coding agents to work effectively without introducing technical debt or architectural violations.

### Why This Template Exists

Modern AI coding assistants are powerful but can introduce subtle bugs, architectural violations, or security issues. This template provides:

- **Immediate feedback loops** for AI agents through fail-fast pipelines
- **Constraint-driven development** that guides AI toward correct patterns  
- **Comprehensive quality gates** that catch issues before they reach production
- **Clear architectural boundaries** that prevent spaghetti code

### Primary Use Case

Built for **LLM-powered applications** that require secure backend infrastructure. Perfect for developers who want to build AI apps (chatbots, content generation, etc.) without exposing API keys in client code or managing complex backend concerns like authentication, rate limiting, and usage tracking.

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/mkwatson/ai-fastify-template.git
cd ai-fastify-template

# Install dependencies
pnpm install

# Verify setup
pnpm turbo build --dry-run
```

### Development

```bash
# Start development (when apps are added)
pnpm dev

# Run quality checks
pnpm lint
pnpm type-check
pnpm test
```

## Project Structure

```
ai-fastify-template/
├── apps/                    # Applications
│   └── backend-api/         # Main Fastify API (coming in MAR-11)
├── packages/                # Shared packages
│   └── sdk/                 # Generated TypeScript SDK (coming in MAR-19)
├── docs/                    # Documentation
│   ├── CONTRIBUTING.md      # Contributing guidelines
│   ├── DEVELOPMENT.md       # Development workflow
│   ├── ARCHITECTURE.md      # Architecture overview
│   └── AI_GUIDELINES.md     # AI agent guidance
├── scripts/                 # Utility scripts
├── .github/                 # GitHub workflows and templates
├── turbo.json              # TurboRepo configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── package.json            # Root package configuration
```

## Technology Stack

| Category | Tool | Rationale |
|----------|------|-----------|
| **Fast streaming API** | Fastify + fastify-sse | Essential for real-time AI responses |
| **Single-binary format + lint** | Biome | Faster than ESLint+Prettier, fewer conflicts |
| **Early type safety** | TypeScript (strict) | Catches AI-generated type errors immediately |
| **Schema validation** | Zod (bodies & env) | Runtime validation prevents silent failures |
| **Guard against spaghetti** | dependency-cruiser | Enforces clean architecture boundaries |
| **High-trust tests** | Vitest + Stryker | Mutation testing catches subtle AI logic errors |
| **Generated SDK & docs** | Fern | Auto-sync client/server contracts |
| **Task caching** | pnpm workspaces + TurboRepo | Fast feedback for AI iteration cycles |
| **Automated updates** | Renovate | Keeps dependencies current without manual work |
| **CI→CD** | GitHub Actions → Vercel | Simple, reliable deployment pipeline |

## Available Scripts

### Root Level
```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages and apps
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm type-check       # Type check all TypeScript

# Quality Gates (fail-fast pipeline)
pnpm ci               # Run complete CI pipeline
pnpm graph            # Validate import dependencies
pnpm mutation         # Run mutation tests

# Utilities
pnpm clean            # Clean all build artifacts
pnpm format           # Format all code
```

### Turbo Pipeline

The project uses a fail-fast pipeline with task dependencies:

```
lint → type-check → graph → test → mutation → build
```

Each step must pass before the next begins, ensuring quality at every stage.

## Workspace Structure

### Apps Directory (`apps/`)
Contains deployable applications:
- Each app has its own `package.json`
- Apps can depend on packages but not other apps
- Apps should be thin, delegating logic to packages

### Packages Directory (`packages/`)
Contains shared libraries:
- Reusable code across apps
- Can depend on other packages
- Should have clear, focused responsibilities

### Workspace Configuration
```yaml
# pnpm-workspace.yaml
packages: ["apps/*", "packages/*"]
```

## Development Workflow

### Adding New Packages

```bash
# Create new app
mkdir apps/my-app
cd apps/my-app
pnpm init

# Create new package  
mkdir packages/my-package
cd packages/my-package
pnpm init
```

### Working with Dependencies

```bash
# Add dependency to specific package
pnpm add --filter my-app fastify

# Add dev dependency to workspace root
pnpm add -Dw typescript

# Install dependencies for all packages
pnpm install
```

### Quality Checks

```bash
# Run full pipeline
pnpm ci

# Run specific checks
pnpm lint           # Code formatting and style
pnpm type-check     # TypeScript compilation
pnpm graph          # Import dependency validation
pnpm test           # Unit and integration tests
pnpm mutation       # Mutation testing
```

## Architecture Principles

### AI-First Design
- **Constraint-driven development** guides AI toward correct patterns
- **Immediate feedback loops** through fail-fast pipelines
- **Clear architectural boundaries** prevent violations
- **Comprehensive validation** catches AI-generated errors

### Quality Gates
- **Strict TypeScript** - No `any` types, comprehensive checking
- **Runtime Validation** - Zod schemas for all inputs
- **Import Graph Validation** - Prevents circular dependencies
- **Mutation Testing** - Ensures tests validate actual logic
- **Comprehensive Testing** - Unit, integration, and end-to-end

### Security First
- Environment variable validation
- Input sanitization and validation
- Secure defaults for all configurations
- No secrets in client code

## Troubleshooting

### Common Issues

**pnpm install fails**
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Turbo cache issues**
```bash
# Clear turbo cache
pnpm turbo clean
rm -rf .turbo
```

**TypeScript errors**
```bash
# Check TypeScript configuration
pnpm type-check
# Fix imports and dependencies
pnpm graph
```

**Pipeline failures**
```bash
# Run pipeline step by step
pnpm lint
pnpm type-check  
pnpm graph
pnpm test
```

### Getting Help

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/mkwatson/ai-fastify-template/issues)
- 💬 [Discussions](https://github.com/mkwatson/ai-fastify-template/discussions)

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to build AI-powered applications?** This template provides the foundation you need to focus on your business logic while maintaining enterprise-grade quality and security. 