# GitHub Actions CI/CD Setup Guide

## 🎯 Overview

This guide documents the enterprise-grade GitHub Actions CI/CD pipeline implementation for the AI Fastify Template. The pipeline provides local testing capabilities to minimize "push and pray" cycles while ensuring consistent quality gates.

## 📋 Implementation Details

### Core Components

1. **GitHub Actions Workflow** (`.github/workflows/ci.yml`)

   - Comprehensive quality validation pipeline
   - Automatic caching and optimization
   - Artifact management for reports and builds

2. **Local Testing Infrastructure**

   - `act` for local GitHub Actions simulation
   - `actionlint` for workflow syntax validation
   - Environment parity validation

3. **Developer Experience Tools**
   - CI doctor script for environment validation
   - Pre-commit workflow validation
   - Comprehensive troubleshooting guidance

## 🚀 Quick Start

### Prerequisites

```bash
# Required tools (installed automatically)
brew install act actionlint
```

### Development Workflow

```bash
# 1. Validate environment
pnpm ci:doctor

# 2. Validate workflow syntax
pnpm ci:validate

# 3. Run CI locally (requires Docker)
pnpm ci:local

# 4. Full quality validation
pnpm ai:compliance
```

## 🔧 Available Scripts

| Script             | Purpose                | When to Use                        |
| ------------------ | ---------------------- | ---------------------------------- |
| `pnpm ci:doctor`   | Environment validation | Setup & troubleshooting            |
| `pnpm ci:validate` | Workflow syntax check  | Before committing workflow changes |
| `pnpm ci:local`    | Run CI locally         | Testing CI changes                 |
| `pnpm ci:debug`    | Verbose local CI       | Debugging CI issues                |

## 📊 Quality Gates

The CI pipeline enforces the following quality gates in order:

1. **Code Formatting & Linting** (`pnpm lint`)

   - ESLint with comprehensive rules
   - Prettier formatting validation
   - Security pattern enforcement

2. **Type Safety** (`pnpm type-check`)

   - TypeScript strict mode validation
   - Cross-package type checking
   - Build-time error prevention

3. **Test Suite** (`pnpm test`)

   - Unit and integration tests
   - 80%+ coverage requirement
   - Property-based testing validation

4. **Mutation Testing** (`pnpm test:mutation`)

   - 90%+ mutation score requirement
   - Business logic validation
   - Test quality assurance

5. **Build Validation** (`pnpm build`)
   - Production build verification
   - Asset optimization
   - Bundle analysis

## 🏗️ Architecture

### Workflow Structure

```yaml
name: CI Pipeline
triggers: [push, pull_request] on main branch
jobs:
  validate:
    environment: ubuntu-latest
    timeout: 15 minutes
    steps:
      - Checkout with full history
      - Setup Node.js (from .nvmrc)
      - Setup pnpm with caching
      - Install dependencies (frozen lockfile)
      - Quality gates (5 stages)
      - Upload artifacts
```

### Environment Parity

| Aspect          | Local       | CI            | Notes                            |
| --------------- | ----------- | ------------- | -------------------------------- |
| Node.js         | 20+         | 20.x          | Specified in .nvmrc              |
| Package Manager | pnpm 8.15+  | pnpm 8.15.0   | Exact version pinned             |
| OS              | macOS/Linux | Ubuntu Latest | Docker available for exact match |
| Cache Strategy  | Manual      | Automatic     | GitHub Actions cache             |

## 🔍 Local Testing

### Using act (GitHub Actions Local Runner)

```bash
# Basic validation (no Docker required)
pnpm ci:validate

# Full local CI run (requires Docker)
pnpm ci:local

# Debug mode with verbose output
pnpm ci:debug
```

### Docker Environment Testing

For exact environment parity:

```bash
# Run pipeline in exact GitHub Actions environment
docker run --rm -v $(pwd):/workspace ubuntu:22.04 bash -c "
  cd /workspace
  # Exact GitHub Actions setup commands
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  npm install -g pnpm@8.15.0
  pnpm install --frozen-lockfile
  pnpm ai:check
"
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. CI Doctor Failures

**Symptom**: `pnpm ci:doctor` reports environment issues

**Solutions**:

```bash
# Install missing tools
brew install act actionlint

# Update Node.js version
nvm install 20
nvm use 20

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. Local act Failures

**Symptom**: `pnpm ci:local` fails with Docker errors

**Solutions**:

```bash
# Start Docker Desktop
open -a Docker

# Use alternative configuration
echo "-P ubuntu-latest=catthehacker/ubuntu:act-latest" > ~/.actrc
```

#### 3. Workflow Validation Errors

**Symptom**: `pnpm ci:validate` reports syntax errors

**Solutions**:

```bash
# Check specific file
actionlint .github/workflows/ci.yml

# Common fixes:
# - Check YAML indentation
# - Verify action versions
# - Validate environment variables
```

#### 4. Quality Gate Failures

**Symptom**: CI fails on specific quality gates

**Solutions**:

```bash
# Run individual checks
pnpm lint          # Fix formatting/linting
pnpm type-check    # Fix TypeScript errors
pnpm test          # Fix failing tests
pnpm test:mutation # Improve test quality
pnpm build         # Fix build issues
```

### Performance Optimization

#### Cache Strategy

- Dependencies cached by `pnpm-lock.yaml` hash
- Build artifacts cached across runs
- Test results cached for mutation testing

#### Execution Time

- Target: < 5 minutes total pipeline time
- Bottleneck: Mutation testing (~15 seconds)
- Optimization: Parallel execution where possible

## 📈 Success Metrics

### Target Outcomes

- **First-try PR success rate**: 85%+ (up from ~30%)
- **CI iteration cycles**: 2-3 (down from 8-10)
- **Developer setup time**: < 10 minutes
- **CI reliability**: 99%+ success rate

### Monitoring

- CI duration tracked in workflow
- Failure rates monitored via GitHub API
- Developer feedback collected regularly

## 🔮 Future Enhancements

### Planned Improvements

1. **Matrix Testing**: Multiple Node.js versions
2. **Performance Regression Detection**: Automated benchmarking
3. **Advanced Caching**: Incremental builds
4. **Deployment Integration**: Automated releases

### Integration Points

- **MAR-34**: Mutation Testing CI/CD Integration
- **MAR-38**: Simple CI/CD Deployment
- **MAR-39**: Advanced Local CI Testing Infrastructure

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [act Local Runner](https://github.com/nektos/act)
- [actionlint Workflow Linter](https://github.com/rhysd/actionlint)
- [pnpm CI/CD Guide](https://pnpm.io/continuous-integration)

## 🤝 Contributing

When modifying the CI pipeline:

1. Test locally with `pnpm ci:validate` and `pnpm ci:local`
2. Use incremental changes (start minimal, add complexity)
3. Update this documentation for any workflow changes
4. Ensure backward compatibility with existing quality gates

---

_This CI/CD implementation follows enterprise-grade practices and provides a foundation for scaling development workflows._
