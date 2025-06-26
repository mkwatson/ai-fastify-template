# Project Memory – AI Fastify Template

## Master Guidelines

@AGENTS.md

## Claude Code Specific Notes

**Things shared across all AI coding agents are in AGENTS.md above.**

Claude-specific guidelines can be added here if needed in the future. For now, all guidelines are maintained in the master AGENTS.md file to ensure consistency across all AI coding tools.

## Quick Reference Commands

```bash
# Development workflow
pnpm ai:quick          # Fast validation during coding
pnpm ai:check          # Pre-commit validation
pnpm ai:compliance     # Full quality pipeline

# CI Validation (CRITICAL: Run before pushing)
pnpm ci:check          # Same validation as GitHub Actions (lint + type-check)

# Project management
# Use Linear MCP tools for issue management
# Use gh CLI for GitHub operations

# Quality tools
pnpm lint:fix          # Auto-fix formatting
pnpm test              # Run tests
pnpm build             # Production build
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
