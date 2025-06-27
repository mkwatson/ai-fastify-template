# Project Memory – AI Fastify Template

## Master Guidelines

@AGENTS.md

## Claude Code Specific Notes

**Things shared across all AI coding agents are in AGENTS.md above.**

Claude-specific guidelines can be added here if needed in the future. For now, all guidelines are maintained in the master AGENTS.md file to ensure consistency across all AI coding tools.

## Quick Reference Commands

```bash
# Development workflow
pnpm ai:quick          # Fast validation during coding (Nx cached)
pnpm ai:check          # Pre-commit validation
pnpm ai:compliance     # Full quality pipeline

# CI Validation (CRITICAL: Run before pushing)
pnpm ci:check          # Same validation as GitHub Actions (lint + type-check + test)
pnpm ci:simulate       # EXACT CI simulation: builds first, then runs ci:check (use when CI fails but local passes)

# Nx affected commands - only run on changed packages
pnpm affected:lint     # Lint only changed packages
pnpm affected:test     # Test only changed packages
pnpm affected:all      # All validation on changed packages

# Project management
# Use Linear MCP tools for issue management
# Use gh CLI for GitHub operations

# Quality tools
pnpm lint:fix          # Auto-fix formatting
pnpm test              # Run tests
pnpm build             # Production build

# Environment check
pnpm doctor            # Check Node/pnpm versions
```

## 🚨 **Critical Workflow: Prevent CI Failures**

**ALWAYS run local validation before pushing:**

```bash
# 1. Before every commit/push
pnpm ci:check          # Matches GitHub Actions exactly

# 2. If you see errors, fix them locally
pnpm lint:fix          # Auto-fix linting issues
pnpm type-check        # Verify TypeScript

# 3. Then commit and push
git add . && git commit -m "your message"
git push
```

**Key Rule**: Never push code that fails `pnpm ci:check` - it will fail in CI and waste time.

## 🚨 **Troubleshooting CI Failures**

**If CI fails but local validation passes:**

```bash
# Use ci:simulate to exactly replicate CI behavior
pnpm ci:simulate       # Runs build first (like CI does), then full validation

# Common cause: TypeScript errors in test files
# CI runs 'pnpm build' which compiles ALL files including tests
# Local 'ci:check' doesn't build first, missing these errors
```

**Solution implemented:**

- Separate `tsconfig.build.json` files exclude test files from production builds
- Pre-push hook uses `ci:simulate` to catch errors before they reach CI
- This prevents the disconnect between local and CI validation
