# 🚀 AI Fastify Template

> AI-optimized backend template using Fastify + TypeScript with comprehensive guardrails

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange)](https://pnpm.io/)

## Overview

This template creates a production-ready Fastify + TypeScript monorepo specifically designed for **AI-assisted development**. It provides comprehensive guardrails that enable AI coding agents to work effectively without introducing technical debt or architectural violations.

### Key Features

- 🏗️ **Monorepo Structure** - pnpm workspaces + TurboRepo for scalable development
- 🔒 **Type Safety** - Strict TypeScript configuration with comprehensive validation
- 🤖 **AI-Optimized** - Designed for seamless AI coding assistant integration
- ⚡ **Fast Feedback** - Fail-fast pipelines with comprehensive quality gates
- 🛡️ **Security First** - Built-in validation, sanitization, and security best practices

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/mkwatson/ai-fastify-template.git
cd ai-fastify-template

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Project Structure

```
ai-fastify-template/
├── apps/                 # Applications
│   └── backend-api/      # Main Fastify API (coming soon)
├── packages/             # Shared packages
├── docs/                 # Documentation
├── turbo.json           # TurboRepo configuration
├── pnpm-workspace.yaml  # pnpm workspace configuration
└── package.json         # Root package configuration
```

## Available Scripts

```bash
# Development
pnpm dev          # Start all apps in development mode
pnpm build        # Build all packages and apps
pnpm test         # Run all tests
pnpm lint         # Lint all code
pnpm format       # Format all code
pnpm type-check   # Type check all TypeScript
pnpm clean        # Clean all build artifacts
```

## Architecture Principles

### AI-First Design
- **Constraint-driven development** that guides AI toward correct patterns
- **Immediate feedback loops** for AI agents through fail-fast pipelines
- **Clear architectural boundaries** that prevent spaghetti code

### Quality Gates
- **Strict TypeScript** - No `any` types, comprehensive type checking
- **Runtime Validation** - Zod schemas for all inputs and environment variables
- **Comprehensive Testing** - Unit, integration, and mutation testing
- **Import Graph Validation** - Dependency cruiser prevents architectural violations

## Technology Stack

| Category | Tool | Rationale |
|----------|------|-----------|
| **Runtime** | Node.js 18+ | Modern JavaScript features, excellent TypeScript support |
| **Framework** | Fastify | High performance, TypeScript-first, extensive plugin ecosystem |
| **Language** | TypeScript (strict) | Type safety, better IDE support, catches errors early |
| **Package Manager** | pnpm | Fast, efficient, great monorepo support |
| **Build System** | TurboRepo | Intelligent caching, parallel execution |
| **Validation** | Zod | Runtime type validation, excellent TypeScript integration |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the quality checks (`pnpm lint && pnpm type-check && pnpm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/mkwatson/ai-fastify-template/issues)
- 💬 [Discussions](https://github.com/mkwatson/ai-fastify-template/discussions) 