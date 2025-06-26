#!/bin/bash
set -e

# 🛡️ Safe Commit Script - Prevents Accidental Bypasses
# 
# This script ensures you always validate before committing and provides
# clear guidance when bypassing is truly necessary.

echo "🛡️ Safe Commit - Enterprise Quality Gate"
echo "========================================"

# Check if user is trying to bypass
BYPASS_FLAG=""
if [[ "$*" == *"--no-verify"* ]]; then
    BYPASS_FLAG="--no-verify"
    echo ""
    echo "⚠️  WARNING: You're bypassing pre-commit validation"
    echo ""
    echo "This should only be used in emergencies. Common reasons:"
    echo "  ✅ Hotfix for production incident (with immediate followup)"
    echo "  ✅ WIP commit that will be squashed before PR"
    echo "  ✅ Docs-only changes that don't affect code quality"
    echo ""
    echo "❌ Bad reasons:"
    echo "  ❌ \"I'll fix it later\" (fix it now with pnpm lint:fix)"
    echo "  ❌ \"It's just a small change\" (small changes can break things)"
    echo "  ❌ \"CI will catch it\" (CI should never be the first place to catch issues)"
    echo ""
    
    read -p "Are you sure you need to bypass validation? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "✅ Good choice! Run 'pnpm ci:check' to see what needs fixing."
        echo ""
        echo "Quick fixes:"
        echo "  pnpm lint:fix     # Auto-fix formatting/linting"
        echo "  pnpm ci:check     # Full validation (same as CI)"
        echo ""
        exit 1
    fi
    
    echo "⚠️  Proceeding with bypass. Please fix issues ASAP after commit."
    echo ""
fi

# If not bypassing, recommend running validation first
if [[ -z "$BYPASS_FLAG" ]]; then
    echo "🚀 Running quick pre-commit validation..."
    echo ""
    
    # Quick validation check
    if ! pnpm ai:quick; then
        echo ""
        echo "❌ Quick validation failed. Options:"
        echo ""
        echo "  1. Fix issues: pnpm lint:fix && pnpm ci:check"
        echo "  2. See details: pnpm lint (for specific errors)"
        echo "  3. Full check: pnpm ci:check (matches CI exactly)"
        echo ""
        echo "Then run: git commit [your-message]"
        exit 1
    fi
    
    echo ""
    echo "✅ Quick validation passed! Proceeding with commit..."
fi

# Extract commit message from arguments (remove --no-verify if present)
COMMIT_ARGS="${@/--no-verify/}"

# Perform the commit
echo "📝 Committing: $COMMIT_ARGS"
git commit $BYPASS_FLAG $COMMIT_ARGS

echo ""
echo "✅ Commit successful!"

# If bypassed, remind about fixing issues
if [[ -n "$BYPASS_FLAG" ]]; then
    echo ""
    echo "⚠️  REMINDER: You bypassed validation. Please run:"
    echo "     pnpm ci:check"
    echo "   and fix any issues before pushing."
fi

echo ""
echo "Next steps:"
echo "  📊 Check status: git status"
echo "  🚀 Push changes: git push"
echo "  🔍 Validate: pnpm ci:check (before pushing)"