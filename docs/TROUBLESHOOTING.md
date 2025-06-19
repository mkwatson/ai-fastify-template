# Troubleshooting Guide

This document covers common issues with the AI Fastify Template development environment and their solutions.

## Pre-commit Hooks Issues

### Hook Installation Problems

#### "pre-commit command not found"

**Problem:** Pre-commit framework is not installed or not in PATH.

**Solutions:**

```bash
# Option 1: Install with pip (global)
pip3 install pre-commit

# Option 2: Install with pipx (isolated, recommended)
pipx install pre-commit

# Option 3: Use homebrew on macOS
brew install pre-commit

# Verify installation
pre-commit --version
```

#### "Python not found" on Windows

**Problem:** Python is not installed or not in PATH on Windows.

**Solutions:**

1. Install Python from [python.org](https://python.org) (check "Add to PATH")
2. Or install Python via Microsoft Store
3. Or use Windows Subsystem for Linux (WSL)

#### Hooks not running on commit

**Problem:** Git hooks are not installed or corrupted.

**Solutions:**

```bash
# Reinstall hooks
pnpm hooks:install

# Check if hooks are installed
ls -la .git/hooks/
# Should see pre-commit and commit-msg files (not .sample)

# Test hooks manually
pnpm hooks:run
```

### Hook Execution Issues

#### "Hook takes too long to run"

**Problem:** Hooks are running on entire codebase instead of staged files.

**Solutions:**

```bash
# Check which hook is slow
pre-commit run --verbose

# Force re-install environments (clears cache)
pre-commit clean
pre-commit install

# Run on specific files only
pre-commit run --files apps/backend-api/src/app.ts
```

#### GitLeaks fails with "no git repository"

**Problem:** Running hooks outside git repository or in subdirectory.

**Solutions:**

```bash
# Ensure you're in the repository root
cd /path/to/ai-fastify-template

# Check git status
git status

# Reinitialize if needed
git init
```

### Code Quality Issues

#### ESLint fails with TypeScript errors

**Problem:** TypeScript compilation errors prevent ESLint from running.

**Solutions:**

```bash
# Check TypeScript errors first
pnpm type-check

# Fix TypeScript errors, then run ESLint
pnpm lint:fix

# Or check specific file
npx eslint apps/backend-api/src/app.ts
```

#### Prettier conflicts with ESLint

**Problem:** Prettier and ESLint have conflicting formatting rules.

**Solutions:**

```bash
# Run ESLint first, then Prettier
npx eslint --fix .
npx prettier --write .

# Or use the combined script
pnpm lint:fix
```

#### "require-await" errors in Fastify plugins

**Problem:** Fastify plugins must be async but don't always need await.

**Solutions:**
This is already configured to be lenient, but if you see errors:

```typescript
// Add ESLint disable comment
export default fp<FastifySensibleOptions>(
  // eslint-disable-next-line require-await
  async fastify => {
    fastify.register(sensible);
  }
);
```

### Commit Message Issues

#### Conventional commit validation fails

**Problem:** Commit message doesn't follow conventional commit format.

**Solutions:**

```bash
# Valid format: type(scope): description
# Examples:
git commit -m "feat(api): add user authentication"
git commit -m "fix(hooks): resolve validation issue"
git commit -m "docs(readme): update installation guide"

# Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
```

#### "unrecognized arguments" in conventional commit hook

**Problem:** Hook configuration has invalid arguments.

**Solutions:**

```bash
# Update hooks to latest versions
pnpm hooks:update

# Or check .pre-commit-config.yaml configuration
# Remove any invalid args like --optional-scope
```

## Development Environment Issues

### pnpm Issues

#### "pnpm: command not found"

**Problem:** pnpm is not installed.

**Solutions:**

```bash
# Install pnpm globally
npm install -g pnpm

# Or use corepack (Node.js 16+)
corepack enable
corepack prepare pnpm@latest --activate

# Verify installation
pnpm --version
```

#### "workspace:\*" dependency errors

**Problem:** Local workspace dependencies not resolving.

**Solutions:**

```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Verify workspace configuration
cat pnpm-workspace.yaml
```

### TypeScript Issues

#### "Cannot find module" errors

**Problem:** TypeScript module resolution issues.

**Solutions:**

```bash
# Check TypeScript configuration
pnpm type-check

# Clean and rebuild
pnpm clean
pnpm build

# Restart TypeScript language server in your editor
```

#### "Type 'any' is not assignable" errors

**Problem:** Strict TypeScript mode catches type issues.

**Solutions:**

```typescript
// Add proper types instead of 'any'
interface User {
  id: string;
  name: string;
}

// Or use unknown if type is truly unknown
const data: unknown = JSON.parse(response);
```

### Turbo Issues

#### "turbo: command not found"

**Problem:** Turbo is not installed or not in PATH.

**Solutions:**

```bash
# Turbo should be installed locally
npx turbo --version

# Or install globally
npm install -g turbo

# Run via pnpm
pnpm build  # Uses turbo under the hood
```

#### Cache issues

**Problem:** Turbo cache is stale or corrupted.

**Solutions:**

```bash
# Clear turbo cache
pnpm clean

# Or remove cache directory
rm -rf .turbo

# Force full rebuild
pnpm build --force
```

## Emergency Procedures

### Bypass Hooks (Emergency Only)

When you need to commit urgently despite hook failures:

```bash
# Skip pre-commit hooks
git commit --no-verify -m "emergency fix"

# Warning: Only use for critical production fixes
# Always fix the underlying issues afterward
```

### Reset Environment

If everything is broken, start fresh:

```bash
# 1. Clean everything
pnpm clean
rm -rf node_modules
rm -rf .turbo

# 2. Remove hooks
pnpm hooks:uninstall

# 3. Reinstall everything
pnpm install
pnpm hooks:install

# 4. Verify setup
pnpm validate:commit
```

### Get Help

If you're still having issues:

1. **Check the logs:** Most tools provide verbose output with `--verbose` flag
2. **Search issues:** Check the [GitHub issues](https://github.com/mkwatson/ai-fastify-template/issues)
3. **Update tools:** Run `pnpm hooks:update` and `pnpm update`
4. **Ask for help:** Create a new GitHub issue with:
   - Your operating system
   - Node.js and pnpm versions
   - Complete error message
   - Steps to reproduce

## Performance Optimization

### Faster Hook Execution

```bash
# Only run hooks on changed files
pre-commit run --files $(git diff --cached --name-only)

# Skip slow hooks during development
SKIP=gitleaks git commit -m "work in progress"

# Use faster TypeScript checking
# (Already configured in this template)
```

### Faster Development Cycles

```bash
# Use watch mode for continuous checking
pnpm test:watch
pnpm dev

# Skip unnecessary rebuilds
pnpm turbo dev --continue
```

This troubleshooting guide covers the most common issues. For specific problems not covered here, please create an issue on GitHub with detailed information about your environment and the error you're encountering.
