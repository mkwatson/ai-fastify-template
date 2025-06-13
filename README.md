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
# Currently available (foundation only)
pnpm build            # Build all packages (currently none)
pnpm lint             # Lint all code (currently none)

# Coming soon with backend-api
pnpm dev              # Start development server
pnpm test             # Run test suites
```

## Project Structure

```
ai-fastify-template/
├── apps/                    # Applications (empty - coming in MAR-11)
├── packages/                # Shared packages (empty - coming later)
├── docs/                    # Documentation ✅
│   ├── CONTRIBUTING.md      # Contributing guidelines ✅
│   ├── DEVELOPMENT.md       # Development workflow ✅
│   ├── ARCHITECTURE.md      # Architecture overview ✅
│   └── AI_GUIDELINES.md     # AI agent guidance ✅
├── turbo.json              # TurboRepo configuration ✅
├── pnpm-workspace.yaml     # pnpm workspace configuration ✅
└── package.json            # Root package configuration ✅
```

## Technology Stack

| Category | Tool | Status | Rationale |
|----------|------|--------|-----------|
| **Fast streaming API** | Fastify + fastify-sse | 🔄 Planned | Essential for real-time AI responses |
| **Single-binary format + lint** | Biome | 🔄 Planned | Faster than ESLint+Prettier, fewer conflicts |
| **Early type safety** | TypeScript (strict) | 🔄 Planned | Catches AI-generated type errors immediately |
| **Schema validation** | Zod (bodies & env) | 🔄 Planned | Runtime validation prevents silent failures |
| **Guard against spaghetti** | dependency-cruiser | 🔄 Planned | Enforces clean architecture boundaries |
| **High-trust tests** | Vitest | 🔄 Planned | Fast, modern testing framework |
| **Task caching** | pnpm workspaces + TurboRepo | ✅ Active | Fast feedback for AI iteration cycles |

## Available Scripts

### Currently Working
```bash
# Foundation
pnpm build            # Build all packages (turbo build)
pnpm dev              # Development mode (turbo dev) 
pnpm lint             # Lint all code (turbo lint)
pnpm clean            # Clean build artifacts (turbo clean)
```

### Coming with Backend API (MAR-11)
```bash
# Quality Gates
pnpm test             # Run test suites
pnpm type-check       # TypeScript compilation check
```

### Coming with Quality Tools (MAR-15+)
```bash
# Advanced Quality Gates
pnpm graph            # Validate import dependencies
pnpm mutation         # Run mutation tests (if implemented)
```

## Workspace Structure

### Apps Directory (`apps/`)
**Status: Empty - First app coming in MAR-11**

Will contain deployable applications:
- Each app has its own `package.json`
- Apps can depend on packages but not other apps
- Apps should be thin, delegating logic to packages

### Packages Directory (`packages/`)
**Status: Empty - First packages coming with backend development**

Will contain shared libraries:
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

## Architecture Principles

### AI-First Design
- **Constraint-driven development** guides AI toward correct patterns
- **Immediate feedback loops** through fail-fast pipelines
- **Clear architectural boundaries** prevent violations
- **Comprehensive validation** catches AI-generated errors

### Quality Gates (Planned)
- **Strict TypeScript** - No `any` types, comprehensive checking
- **Runtime Validation** - Zod schemas for all inputs
- **Import Graph Validation** - Prevents circular dependencies
- **Comprehensive Testing** - Unit, integration, and end-to-end

### Security First (Planned)
- Environment variable validation
- Input sanitization and validation
- Secure defaults for all configurations
- No secrets in client code

## Current Status

This template is in **active development**. Current state:

✅ **Foundation Complete**
- Monorepo structure with pnpm + TurboRepo
- Comprehensive documentation
- AI-first development guidelines

🔄 **In Progress**
- Backend API application (MAR-11)
- TypeScript strict configuration
- Zod validation patterns

📋 **Planned**
- Quality tooling (Biome, dependency-cruiser)
- Testing framework (Vitest)
- CI/CD pipeline

## Troubleshooting

### Common Issues

**No packages to build/test**
```bash
# Expected - no apps/packages exist yet
pnpm build  # Will show "0 packages"
pnpm test   # Will show "0 packages"
```

**Getting Started**
- Follow the plan.md for step-by-step implementation
- Start with MAR-11 (Backend API) for first working application
- Refer to docs/ for detailed guidelines

### Getting Help

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/mkwatson/ai-fastify-template/issues)
- 💬 [Discussions](https://github.com/mkwatson/ai-fastify-template/discussions)

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to build AI-powered applications?** This template provides the foundation you need. Follow the implementation plan in `plan.md` to add your first backend API. 