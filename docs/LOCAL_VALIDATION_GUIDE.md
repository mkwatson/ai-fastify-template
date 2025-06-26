# 🛡️ Local Validation Guide - Prevent CI Failures

**CRITICAL**: Always validate locally before pushing. Local validation should **exactly match CI**.

## 🚨 **The Golden Rule**

> **Your code should pass ALL checks locally before pushing to CI**

CI failures are expensive, slow down development, and often indicate process failures. This guide ensures you catch issues locally in seconds, not minutes in CI.

## ⚡ **Quick Commands (Use These Daily)**

```bash
# 🚀 FASTEST: Core validation (lint + types + tests + build) - ~30 seconds
pnpm ci:check

# 🔧 FIX: Auto-fix formatting and linting issues
pnpm lint:fix

# 🎯 TARGETED: Check specific areas
pnpm lint        # ESLint validation
pnpm type-check  # TypeScript compilation
pnpm test        # Test suite
pnpm build       # Production build
```

## 🏗️ **Comprehensive Validation Pipeline**

### **Level 1: Lightning Fast (~5 seconds)**

```bash
pnpm ai:quick    # lint + type-check
```

Use this constantly during development for immediate feedback.

### **Level 2: Core Validation (~30 seconds)**

```bash
pnpm ci:check    # Same as CI: lint + type-check + test + build
```

**This should match CI exactly.** Run before every commit.

### **Level 3: Full Compliance (~5 minutes)**

```bash
pnpm ai:compliance  # Full pipeline: mutation testing + security audit
```

Run before important PRs or releases.

## 🔍 **Troubleshooting Common Issues**

### **ESLint Errors**

```bash
# See what's wrong
pnpm lint

# Auto-fix most issues
pnpm lint:fix

# Common patterns
eslint --fix src/problematic-file.ts  # Fix specific file
```

### **TypeScript Errors**

```bash
# Check types without building
pnpm type-check

# Common issues:
# - Missing return types (add ': ReturnType')
# - Import errors (check file paths)
# - Type mismatches (check interfaces)
```

### **Test Failures**

```bash
# Run tests with verbose output
pnpm test

# Run specific test file
pnpm test -- path/to/test.ts

# Run tests in watch mode for development
pnpm test:watch
```

### **Build Failures**

```bash
# Clean and rebuild
pnpm clean && pnpm build

# Check for circular dependencies
pnpm graph
```

## 🚀 **Pre-Commit Hook Integration**

The pre-commit hooks automatically run comprehensive validation:

1. **Security scanning** (GitLeaks)
2. **File hygiene** (size limits, merge conflicts)
3. **Code quality** (ESLint + Prettier)
4. **Core validation** (`pnpm ci:check`)
5. **Security audit** (dependency vulnerabilities)
6. **File validation** (YAML syntax)
7. **GitHub Actions** (workflow validation)

### **If Pre-Commit Fails:**

```bash
# Fix the issues shown in the output
pnpm lint:fix
pnpm ci:check

# Then commit normally
git add . && git commit -m "your message"
```

### **Emergency Bypass (Use Sparingly)**

```bash
# Only if you have a very good reason and will fix immediately
git commit --no-verify -m "emergency: detailed justification required"

# Follow up immediately with:
pnpm ci:check  # Fix any issues
git add . && git commit -m "fix: address validation issues"
```

## 🎯 **IDE Integration**

### **VS Code Setup**

Add to `.vscode/settings.json`:

```json
{
  "eslint.autoFixOnSave": true,
  "editor.formatOnSave": true,
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### **Pre-Push Hook (Optional)**

```bash
# Add to .husky/pre-push for extra safety
#!/usr/bin/env sh
echo "🚀 Pre-push validation..."
if ! pnpm ci:check; then
  echo "❌ Pre-push validation failed. Fix issues before pushing."
  exit 1
fi
```

## 📊 **Performance Benchmarks**

- **pnpm ai:quick**: ~5 seconds (use constantly)
- **pnpm ci:check**: ~30 seconds (before every commit)
- **pnpm ai:compliance**: ~5 minutes (before PRs)
- **Full pre-commit**: ~60 seconds (automatic on commit)

## 🎯 **Success Metrics**

✅ **You're doing it right when:**

- Local validation passes on first try
- CI builds are green without manual fixes
- No "fix linting" commits in your PR history
- Development velocity stays high

❌ **Warning signs:**

- Frequent CI failures requiring fixes
- Multiple "fix lint/types" commits
- Bypassing pre-commit hooks regularly
- Pushing without local validation

## 🆘 **Getting Help**

1. **Check this guide first** - covers 90% of common issues
2. **Run diagnostic**: `pnpm ci:check` shows exactly what's failing
3. **Check existing patterns**: Look at similar working code
4. **Team review**: If stuck, ask for pair programming session

## 🎁 **Pro Tips**

- **Use `pnpm ai:quick` constantly** while coding for instant feedback
- **Set up IDE auto-fix** to catch issues as you type
- **Run `pnpm ci:check` before starting work** to ensure clean baseline
- **Never bypass pre-commit** unless it's a true emergency with immediate fix planned
- **Keep this validation time fast** - if it gets slow, we'll optimize it

---

**Remember**: The goal is to catch issues locally in seconds, not in CI after minutes. This guide ensures robust, maintainable development workflow with minimal overhead.
