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
- **Python** >= 3.8 (for pre-commit hooks)

### Installation

```bash
# Clone the repository
git clone https://github.com/mkwatson/ai-fastify-template.git
cd ai-fastify-template

# Quick setup (recommended)
pnpm setup:dev        # Installs dependencies + pre-commit hooks

# OR manual setup
pnpm install           # Install dependencies only
pnpm hooks:install     # Install pre-commit hooks separately

# Verify setup
pnpm build --dry-run
```

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

## 🛡️ Quality Gates

This template includes **enterprise-grade quality gates** that run automatically to catch issues before they reach production:

### Pre-commit Hooks

**Automatic quality checks on every commit:**

- 🔒 **GitLeaks** - Prevents credential leaks and secrets
- 🎨 **ESLint + Prettier** - Auto-fixes formatting and linting issues
- 🔷 **TypeScript** - Validates type safety
- 📝 **Conventional Commits** - Enforces commit message standards
- 📏 **File Hygiene** - Checks file sizes, trailing whitespace, YAML/JSON syntax
- 🛡️ **Security Audit** - Scans dependencies for vulnerabilities

### Quality Scripts

```bash
# Pre-commit hook management
pnpm hooks:install      # Install git hooks (run once)
pnpm hooks:run          # Run all hooks manually
pnpm hooks:update       # Update hook versions

# Development quality
pnpm ai:quick           # Fast quality check (lint + type-check)
pnpm ai:compliance      # Full compliance check (all quality gates)
pnpm validate:commit    # Complete validation (hooks + compliance)

# Emergency bypass (use sparingly!)
git commit --no-verify  # Skip hooks for critical fixes
```

### Commit Message Format

This project enforces **conventional commits** for clear change tracking:

```bash
# Valid commit types:
feat(scope): add new feature
fix(scope): bug fix
docs(scope): documentation updates
style(scope): formatting changes
refactor(scope): code restructuring
perf(scope): performance improvements
test(scope): test updates
build(scope): build system changes
ci(scope): CI/CD changes
chore(scope): maintenance tasks

# Examples:
git commit -m "feat(api): add user authentication endpoint"
git commit -m "fix(hooks): resolve conventional commit validation"
git commit -m "docs(readme): update installation instructions"
```

## Project Structure

```
ai-fastify-template/
├── apps/                    # Applications ✅
│   └── backend-api/         # Fastify backend API ✅
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

| Category                    | Tool                        | Status     | Rationale                                         |
| --------------------------- | --------------------------- | ---------- | ------------------------------------------------- |
| **Fast streaming API**      | Fastify + fastify-sse       | ✅ Active  | Essential for real-time AI responses              |
| **Linting + Formatting**    | ESLint + Prettier           | ✅ Active  | Industry standard with custom architectural rules |
| **Early type safety**       | TypeScript (strict)         | ✅ Active  | Catches AI-generated type errors immediately      |
| **Schema validation**       | Zod (bodies & env)          | 🔄 Planned | Runtime validation prevents silent failures       |
| **Guard against spaghetti** | dependency-cruiser          | 🔄 Planned | Enforces clean architecture boundaries            |
| **High-trust tests**        | Vitest                      | ✅ Active  | Fast, modern testing framework                    |
| **Task caching**            | pnpm workspaces + TurboRepo | ✅ Active  | Fast feedback for AI iteration cycles             |

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
pnpm type-check       # TypeScript compilation check
pnpm lint             # Code formatting and linting (ESLint + Prettier)
```

### Pre-commit Hooks & Quality Gates

```bash
# Setup and management
pnpm setup:dev        # Complete development setup (dependencies + hooks)
pnpm hooks:install    # Install pre-commit hooks
pnpm hooks:uninstall  # Remove pre-commit hooks
pnpm hooks:update     # Update hook versions
pnpm hooks:run        # Run all hooks manually

# Quality validation
pnpm ai:quick         # Fast quality check (lint + type-check)
pnpm ai:compliance    # Full compliance check (all quality gates)
pnpm validate:commit  # Complete validation (hooks + compliance)
```

### Advanced Quality Tools (Planned)

```bash
# Advanced Quality Gates
pnpm graph            # Validate import dependencies
pnpm mutation         # Run mutation tests (if implemented)
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

**Status: Empty - Shared packages planned for future development**

Will contain shared libraries:

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

✅ **Backend API Complete (MAR-11)**

- Production-ready Fastify server with TypeScript
- Strict TypeScript configuration with enterprise standards
- Comprehensive test setup with Vitest
- Development and production scripts

📋 **Next Steps**

- Quality tooling (dependency-cruiser, mutation testing)
- Zod validation patterns
- SSE streaming capabilities
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

### Advanced Debugging

```bash
# Advanced turbo commands for debugging
pnpm build --verbosity=2     # Verbose build output with detailed logs
pnpm clean                   # Clear build artifacts and cache
pnpm build --dry-run         # See what would run without executing
```

## 🤖 AI Coding Agent Guidelines

We maintain comprehensive, consistent coding guidelines across our three primary AI coding tools—**OpenAI Codex**, **Anthropic's Claude Code**, and **Cursor IDE**.

### File Structure

- **[`AGENTS.md`](./AGENTS.md)** – Authoritative source for all coding guidelines
- **[`CLAUDE.md`](./CLAUDE.md)** – Imports `AGENTS.md` for Claude Code integration
- **[`.cursor/rules/default.mdc`](./.cursor/rules/default.mdc)** – References `AGENTS.md` for Cursor IDE

### Why This Structure?

- **Single Source of Truth:** One definitive place for all guidelines
- **Tool Compatibility:** Each tool's specific import/reference requirements handled
- **Maintainability:** Update once, applies everywhere
- **Extensibility:** Clear path for tool-specific additions if needed

### Quality Integration

Guidelines integrate with our quality pipeline:

```bash
pnpm ai:quick      # Quick validation (lint + types + patterns)
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

**Ready to build AI-powered applications?** This template provides the foundation you need. Follow the implementation plan in `plan.md` to add your first backend API.
