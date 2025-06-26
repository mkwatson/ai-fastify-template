# 🛡️ Local Validation Guide - Prevent CI Failures

**CRITICAL**: Always validate locally before pushing. Local validation should **exactly match CI**.

## 🚨 **The Golden Rule**

> **Your code should pass ALL checks locally before pushing to CI**

CI failures are expensive, slow down development, and often indicate process failures. This guide ensures you catch issues locally in seconds, not minutes in CI.

## ⚡ **Quick Commands (Use These Daily)**

```bash
# 🚀 FASTEST: Core validation (lint + types + tests + build) - ~30 seconds
pnpm ci:check               # Uses zero-drift validation pipeline

# ⚡ DEVELOPMENT: Lightning fast feedback - ~5 seconds
pnpm ai:quick               # Parallel lint + type-check with smart caching

# 🔧 FIX: Auto-fix formatting and linting issues
pnpm lint:fix

# 🎯 TARGETED: Direct validation pipeline access
node scripts/validation-pipeline.mjs --preset quick      # Fast development validation
node scripts/validation-pipeline.mjs --preset ci        # Complete CI validation
node scripts/validation-pipeline.mjs --preset pre-commit # Pre-commit validation
node scripts/validation-pipeline.mjs --clear-cache      # Clear validation cache
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

## 🛡️ **Zero-Drift Validation Architecture**

**BREAKTHROUGH**: This project implements a **zero-drift validation architecture** that eliminates configuration differences between local and CI validation.

### **How It Works**

1. **Single Source of Truth**: All validation logic lives in `scripts/validation-pipeline.mjs`
2. **Config-Aware Caching**: Automatically invalidates cache when config files change
3. **CI Parity Enforcement**: CI automatically verifies it uses the same pipeline as local commands

### **Key Benefits**

✅ **Impossible Configuration Drift**: Local and CI use identical validation logic  
✅ **Smart Caching**: No more cache confusion - automatically knows when to invalidate  
✅ **Developer Friendly**: Same commands work everywhere with consistent results  
✅ **Self-Healing**: Pipeline consistency is automatically verified in CI

### **Available Presets**

- **`quick`**: Fast development validation (lint + type-check, ~5s)
- **`ci`**: Complete CI validation (lint + type-check + test + build, ~30s)
- **`pre-commit`**: Pre-commit validation (lint + type-check + test)
- **`compliance`**: Full compliance (includes mutation testing, ~5min)

### **Cache Strategies**

- **`none`**: Never use cache (slowest, most accurate)
- **`smart`**: Use cache intelligently based on preset
- **`config-aware`**: Invalidate cache when config files change (recommended)

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

### **Cache Issues (Now Automatically Handled)**

With the new zero-drift architecture, cache issues are largely eliminated:

```bash
# Clear validation pipeline cache (smart invalidation)
node scripts/validation-pipeline.mjs --clear-cache

# Force fresh validation (bypasses all caches)
pnpm ci:check --force    # Or any validation command with --force

# Turbo cache issues (legacy - rarely needed now)
rm -rf .turbo && pnpm clean && pnpm ci:check
```

**Zero-Drift Benefits**:

- ✅ **Config-aware caching** automatically invalidates when config files change
- ✅ **CI forces fresh validation** so no stale results leak through
- ✅ **Smart cache strategies** eliminate most cache confusion

**Rare scenarios**: If you still see cache issues, run with `--force` flag or clear validation cache.

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
