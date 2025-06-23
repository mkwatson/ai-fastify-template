# 🚀 AI Fastify Template

> Production-ready Fastify + TypeScript monorepo optimized for AI-assisted development

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-orange)](https://pnpm.io/)

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

- **Node.js** >= 20.0.0
- **pnpm** >= 10.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/mkwatson/ai-fastify-template.git
cd ai-fastify-template

# Setup development environment (includes GitLeaks security scanner)
pnpm setup:dev

# Verify setup
pnpm ai:quick
```

#### Manual GitLeaks Installation

If you need to install GitLeaks separately or the automatic installation fails:

```bash
# Install GitLeaks using the enterprise installation script
pnpm setup:gitleaks

# Or manually via package manager:
# macOS: brew install gitleaks
# Ubuntu/Debian: sudo apt-get install gitleaks
# RHEL/CentOS: sudo yum install gitleaks
```

> **Note**: GitLeaks is required for the pre-commit security scanning. The setup script automatically handles installation across different platforms.

### Development

```bash
# Start development server
pnpm dev              # Start all apps in development mode

# Build and test
pnpm build            # Build all packages
pnpm test             # Run all test suites
pnpm type-check       # TypeScript compilation check

# Quality assurance
pnpm lint             # Code formatting and linting (ESLint + Prettier)
pnpm clean            # Clean build artifacts
```

## Project Structure

```
ai-fastify-template/
├── apps/                    # Applications ✅
│   └── backend-api/         # Fastify backend API ✅
├── packages/                # Shared packages ✅
│   └── config/              # Configuration utilities ✅
├── docs/                    # Documentation ✅
│   ├── CONTRIBUTING.md      # Contributing guidelines ✅
│   ├── DEVELOPMENT.md       # Development workflow ✅
│   └── ARCHITECTURE.md      # Architecture overview ✅
├── turbo.json              # TurboRepo configuration ✅
├── pnpm-workspace.yaml     # pnpm workspace configuration ✅
└── package.json            # Root package configuration ✅
```

## Technology Stack

| Category                    | Tool                        | Status    | Rationale                                            |
| --------------------------- | --------------------------- | --------- | ---------------------------------------------------- |
| **Fast streaming API**      | Fastify + fastify-sse       | ✅ Active | Essential for real-time AI responses                 |
| **Linting + Formatting**    | ESLint + Prettier           | ✅ Active | Industry standard with custom architectural rules    |
| **Early type safety**       | TypeScript (strict)         | ✅ Active | Catches AI-generated type errors immediately         |
| **Schema validation**       | Zod (bodies & env)          | ✅ Active | Runtime validation prevents silent failures          |
| **Security scanning**       | GitLeaks + audit-ci         | ✅ Active | Prevents credential leaks and vulnerability exposure |
| **Guard against spaghetti** | dependency-cruiser          | ✅ Active | Enforces clean architecture boundaries               |
| **High-trust tests**        | Vitest + Coverage           | ✅ Active | Comprehensive testing with unit & integration        |
| **Mutation testing**        | Stryker                     | ✅ Active | Ensures tests validate business logic (99.04% score) |
| **Task caching**            | pnpm workspaces + TurboRepo | ✅ Active | Fast feedback for AI iteration cycles                |

## Available Scripts

### Core Development

```bash
# Development workflow
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages
pnpm clean            # Clean build artifacts

# Quality assurance
pnpm test             # Run all test suites
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report
pnpm type-check       # TypeScript compilation check
```

### Security & Quality Tools

```bash
# Enterprise-grade quality pipeline
pnpm ai:quick         # Fast validation (lint + type-check)
pnpm ai:check         # Standard validation (includes security)
pnpm ai:compliance    # Full compliance validation
pnpm ai:security      # Security audit of dependencies

# Security scanning
pnpm security:scan    # Run GitLeaks credential scanning
pnpm setup:gitleaks   # Install/update GitLeaks scanner

# Advanced Quality Gates
pnpm lint             # Code formatting and linting (ESLint + Prettier)
pnpm test:mutation    # Run mutation tests (99.04% score)
```

## Workspace Structure

### Apps Directory (`apps/`)

**Status: ✅ Active - Backend API implemented**

Contains deployable applications:

- **`backend-api/`** - Production-ready Fastify server with TypeScript
- Each app has its own `package.json`
- Apps can depend on packages but not other apps
- Apps should be thin, delegating logic to packages

### Packages Directory (`packages/`)

**Status: ✅ Active - Configuration utilities implemented**

Contains shared libraries:

- Reusable code across apps
- Can depend on other packages
- Should have clear, focused responsibilities

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages: ['apps/*', 'packages/*']
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

### Quality Gates (Implemented)

- **Strict TypeScript** - No `any` types, comprehensive checking with type-aware ESLint rules
- **Runtime Validation** - Zod schemas for all environment variables and request inputs
- **Import Graph Validation** - dependency-cruiser prevents circular dependencies and enforces architecture
- **Comprehensive Testing** - Unit, integration tests with 99.04% mutation testing score

### Security First (Implemented)

- Environment variable validation with Zod schemas
- Input sanitization and validation at all API boundaries
- GitLeaks pre-commit scanning for credential detection
- Dependency vulnerability scanning with audit-ci

## Current Status

This template is in **active development**. Current state:

✅ **Foundation Complete**

- Monorepo structure with pnpm + TurboRepo
- Comprehensive documentation
- AI-first development guidelines

✅ **Backend API Complete (MAR-11)**

- Production-ready Fastify server with TypeScript
- Strict TypeScript configuration with enterprise standards
- Comprehensive test setup with Vitest
- Development and production scripts

✅ **Quality Tooling Complete**

- dependency-cruiser for architectural validation
- Mutation testing with Stryker (99.04% score)
- Zod validation patterns for environment and inputs
- Comprehensive testing framework with Vitest
- CI/CD pipeline with GitHub Actions

## Troubleshooting

### Common Issues

**Fast Quality Validation**

```bash
# Quick validation during development
pnpm ai:quick        # Lint + type-check (fast)
pnpm ai:check        # + dependency validation
pnpm ai:compliance   # Full quality pipeline
```

**Getting Started**

- Follow the [Quick Start](#quick-start) guide above
- The backend API is already implemented and ready to use
- Refer to [docs/](docs/) for detailed development guidelines

### Advanced Debugging

```bash
# Advanced turbo commands for debugging
pnpm build --verbosity=2     # Verbose build output with detailed logs
pnpm clean                   # Clear build artifacts and cache
turbo build --dry-run         # See what would run without executing
```

## 🤖 AI Coding Agent Guidelines

We maintain comprehensive, consistent coding guidelines across our three primary AI coding tools—**OpenAI Codex**, **Anthropic's Claude Code**, and **Cursor IDE**.

### File Structure

- **[`AGENTS.md`](./AGENTS.md)** – Authoritative source for all coding guidelines
- **[`CLAUDE.md`](./CLAUDE.md)** – Imports `AGENTS.md` for Claude Code integration
- **Cursor IDE** – Configure to reference `AGENTS.md` for consistent guidelines

### Why This Structure?

- **Single Source of Truth:** One definitive place for all guidelines
- **Tool Compatibility:** Each tool's specific import/reference requirements handled
- **Maintainability:** Update once, applies everywhere
- **Extensibility:** Clear path for tool-specific additions if needed

### Quality Integration

Guidelines integrate with our quality pipeline:

```bash
pnpm ai:quick      # Quick validation (lint + type-check)
pnpm ai:check      # Standard validation (includes security)
pnpm ai:compliance # Full compliance validation
```

_Always edit AGENTS.md for shared guidelines. Tool-specific files should remain minimal imports/references._

### Getting Help

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/mkwatson/ai-fastify-template/issues)
- 💬 [Discussions](https://github.com/mkwatson/ai-fastify-template/discussions)

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to build AI-powered applications?** This template provides the complete foundation you need with a production-ready Fastify backend, comprehensive testing, and AI-optimized development workflows.
