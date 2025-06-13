# Development Workflow

This document outlines the development workflow for the AI Fastify Template project, including setup, daily development practices, and release processes.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Daily Development](#daily-development)
- [Quality Assurance](#quality-assurance)
- [Turbo Pipeline](#turbo-pipeline)
- [Debugging](#debugging)
- [Performance](#performance)
- [Release Process](#release-process)

## Environment Setup

### Prerequisites

Ensure you have the required tools installed:

```bash
# Check versions
node --version    # >= 18.0.0
pnpm --version    # >= 8.0.0
git --version     # >= 2.0.0
```

### Initial Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/mkwatson/ai-fastify-template.git
   cd ai-fastify-template
   pnpm install
   ```

2. **Verify installation**
   ```bash
   # Check workspace structure
   pnpm list --depth=0
   
   # Verify turbo works
   pnpm turbo --version
   
   # Run dry-run build
   pnpm turbo build --dry-run
   ```

3. **Set up development environment**
   ```bash
   # Copy environment template (when available)
   cp .env.example .env.local
   
   # Configure your editor for TypeScript
   # VS Code: Install recommended extensions
   # Cursor: AI rules are already configured
   ```

## Daily Development

### Starting Development

```bash
# Pull latest changes
git checkout main
git pull origin main

# Install any new dependencies
pnpm install

# Start development mode (when apps exist)
pnpm dev
```

### Creating New Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Add new packages as needed**
   ```bash
   # New app
   mkdir apps/my-app
   cd apps/my-app
   pnpm init
   
   # New shared package
   mkdir packages/my-package
   cd packages/my-package
   pnpm init
   ```

3. **Install dependencies**
   ```bash
   # App-specific dependency
   pnpm add --filter my-app fastify
   
   # Workspace dev dependency
   pnpm add -Dw @types/node
   
   # Package dependency
   pnpm add --filter @ai-fastify-template/my-package zod
   ```

### Development Loop

1. **Make changes**
   - Write code following TypeScript strict mode
   - Add tests for new functionality
   - Update documentation as needed

2. **Run quality checks frequently**
   ```bash
   # Available checks during development
   pnpm lint
   pnpm build
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat(scope): description of changes"
   ```

## Quality Assurance

### Quality Checks

The project will use a fail-fast pipeline (coming with backend development):

```
lint → type-check → test → build
```

### Running Quality Checks

```bash
# Currently available
pnpm lint           # Code formatting and linting (when packages exist)
pnpm build          # Production build

# Coming with backend development
pnpm type-check     # TypeScript compilation
pnpm test           # Unit and integration tests
```

### Quality Standards

- **TypeScript**: Strict mode, no `any` types
- **Testing**: >90% coverage, comprehensive test suites
- **Architecture**: Clean dependencies, no cycles
- **Performance**: Optimized builds, efficient caching

## Turbo Pipeline

### Understanding Turbo

TurboRepo provides intelligent caching and parallel execution:

```bash
# View pipeline configuration
cat turbo.json

# Run with verbose output
pnpm turbo build --verbose

# Clear cache if needed
pnpm turbo clean
```

### Pipeline Configuration

```json
{
  "tasks": {
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["lint"],
      "outputs": []
    },
    "graph": {
      "dependsOn": ["type-check"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["graph"],
      "outputs": ["coverage/**"]
    },
    "mutation": {
      "dependsOn": ["test"],
      "outputs": []
    },
    "build": {
      "dependsOn": ["mutation"],
      "outputs": ["dist/**", "build/**"]
    }
  }
}
```

### Caching Benefits

- **Local caching**: Skips unchanged tasks
- **Remote caching**: Share cache across team (when configured)
- **Incremental builds**: Only rebuild what changed

```bash
# First run (cache miss)
pnpm turbo build
# → Takes full time

# Second run (cache hit)
pnpm turbo build
# → Nearly instant with "FULL TURBO"
```

## Debugging

### Common Issues

**TypeScript Errors**
```bash
# Check specific package
pnpm --filter my-app type-check

# View detailed errors
pnpm tsc --noEmit --pretty
```

**Dependency Issues**
```bash
# Check dependency graph
pnpm graph

# View workspace dependencies
pnpm list --depth=1

# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Turbo Cache Issues**
```bash
# Clear turbo cache
pnpm turbo clean
rm -rf .turbo

# Force rebuild
pnpm turbo build --force
```

**Import/Export Errors**
```bash
# Check for circular dependencies
pnpm graph

# Verify package exports
cat packages/my-package/package.json
```

### Debug Tools

```bash
# Verbose turbo output
pnpm turbo build --verbose

# Dependency analysis
pnpm why package-name

# Workspace info
pnpm list --depth=0

# Package resolution
pnpm resolve package-name
```

## Performance

### Build Performance

```bash
# Measure build time
time pnpm turbo build

# Analyze cache efficiency
pnpm turbo build --summarize

# Profile specific tasks
pnpm turbo build --profile
```

### Development Performance

- **Incremental compilation**: TypeScript project references
- **Hot reloading**: Fast refresh in development
- **Selective execution**: Only run affected packages

### Optimization Tips

1. **Use turbo filtering**
   ```bash
   # Only build affected packages
   pnpm turbo build --filter=...my-app
   
   # Build specific package and dependencies
   pnpm turbo build --filter=my-app...
   ```

2. **Leverage caching**
   ```bash
   # Ensure outputs are configured correctly
   # Check turbo.json for proper output patterns
   ```

3. **Optimize dependencies**
   ```bash
   # Use exact versions for stability
   pnpm add --save-exact package-name
   
   # Audit bundle size
   pnpm dlx bundle-analyzer
   ```

## Release Process

### Pre-Release Checklist

1. **Quality assurance**
   ```bash
   pnpm ci
   ```

2. **Documentation updates**
   - Update README if needed
   - Update CHANGELOG
   - Verify all docs are current

3. **Version management**
   ```bash
   # Update version in package.json
   # Follow semantic versioning
   ```

### Release Steps

1. **Create release branch**
   ```bash
   git checkout -b release/v1.0.0
   ```

2. **Final testing**
   ```bash
   pnpm ci
   pnpm test:e2e  # When available
   ```

3. **Create release**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **Deploy** (automated via GitHub Actions)

### Post-Release

1. **Monitor deployment**
2. **Update documentation**
3. **Communicate changes**

## Best Practices

### Code Organization

- **Single responsibility**: Each package has one clear purpose
- **Clear interfaces**: Well-defined APIs between packages
- **Minimal coupling**: Reduce dependencies between packages

### Testing Strategy

- **Unit tests**: Test individual functions and classes
- **Integration tests**: Test package interactions
- **End-to-end tests**: Test complete workflows

### Documentation

- **Code comments**: Only for complex business logic
- **README files**: For each package with public API
- **Architecture docs**: For significant design decisions

### Performance

- **Bundle analysis**: Regular checks on bundle size
- **Dependency audits**: Keep dependencies minimal and current
- **Caching strategy**: Leverage turbo caching effectively

## Troubleshooting

### Getting Help

1. **Check documentation**: Start with `docs/` directory
2. **Search issues**: Look for similar problems
3. **Run diagnostics**: Use built-in debugging tools
4. **Ask for help**: Create detailed issue reports

### Common Solutions

- **Clean install**: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
- **Clear cache**: `pnpm turbo clean`
- **Reset git**: `git clean -fdx` (careful!)
- **Update tools**: Ensure latest versions of Node.js and pnpm

---

This workflow ensures consistent, high-quality development while leveraging the full power of the monorepo setup and AI-assisted development capabilities. 