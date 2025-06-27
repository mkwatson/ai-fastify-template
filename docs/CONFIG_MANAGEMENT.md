# Configuration Management Guide

## 🚨 Critical: Dual Vitest Configuration System

This project maintains **two separate Vitest configurations** to support both workspace testing and mutation testing (Stryker compatibility). This document outlines the safety measures and procedures for managing these configurations.

## Configuration Files

### 1. `vitest.base.config.ts` - Single Source of Truth

**MOST IMPORTANT**: Contains all shared configuration properties.

```typescript
export const baseConfig = {
  test: {
    globals: true, // ← MUST be identical
    environment: 'node', // ← MUST be identical
    testTimeout: 10000, // ← MUST be identical
    // ... other shared properties
  },
  resolve: {
    alias: {
      /* ... */
    }, // ← MUST be identical
  },
};
```

### 2. `vitest.config.ts` - Workspace Configuration

Inherits from base config, adds workspace-specific settings.

### 3. `vitest.mutation.config.ts` - Mutation Testing Configuration

Inherits from base config, disables workspace mode for Stryker compatibility.

## Safety Guarantees

### 🛡️ Three-Layer Protection System

1. **Shared Base Configuration**
   - All critical properties defined once in `vitest.base.config.ts`
   - Both configs import and extend the base config
   - Eliminates manual synchronization for shared properties

2. **Automated Validation**
   - `scripts/validate-vitest-configs.js` compares actual config objects
   - Validates critical properties match exactly
   - Catches configuration drift before it causes issues

3. **Git Hooks & CI Gates**
   - Pre-commit hook validates configs when changed
   - CI workflow runs validation on all config changes
   - Pull request template includes config change checklist

## Configuration Change Workflow

### ✅ Safe: Modifying Shared Properties

1. **Edit `vitest.base.config.ts` only**

   ```bash
   # Edit the base config
   vim vitest.base.config.ts

   # Validate changes
   pnpm test:config:verify

   # Commit (hooks will validate automatically)
   git add vitest.base.config.ts
   git commit -m "update: shared test timeout configuration"
   ```

2. **Both configs automatically inherit changes**
   - No manual synchronization required
   - Validation ensures consistency

### ✅ Safe: Modifying Config-Specific Properties

1. **For workspace-only changes** (edit `vitest.config.ts`):

   ```typescript
   export default mergeConfig(
     baseConfig,
     defineConfig({
       // Only workspace-specific overrides here
       test: {
         workspace: './vitest.workspace.ts',
       },
     })
   );
   ```

2. **For mutation-only changes** (edit `vitest.mutation.config.ts`):
   ```typescript
   export default mergeConfig(
     baseConfig,
     defineConfig({
       test: {
         workspace: undefined, // Disable workspace
         pool: 'threads', // Mutation-specific
       },
     })
   );
   ```

### ❌ Dangerous: Direct Property Duplication

**NEVER do this:**

```typescript
// ❌ BAD: Duplicating shared properties
export default defineConfig({
  test: {
    globals: true, // ← Duplicated from base!
    environment: 'node', // ← Will drift over time!
    testTimeout: 10000, // ← Manual sync required!
  },
});
```

## Validation Commands

### Quick Validation (Development)

```bash
# Fast config object comparison
node scripts/validate-vitest-configs.js
```

### Full Validation (Pre-Push)

```bash
# Config validation + test execution comparison
pnpm test:config:verify
```

### Ultra-Fast Validation (CI)

```bash
# Quick validation for pre-push hooks
pnpm test:config:quick
```

## Troubleshooting

### Config Validation Failures

**Problem**: `❌ CONFIGURATION VALIDATION FAILED`

**Solution**:

1. Check which properties are out of sync
2. Move shared properties to `vitest.base.config.ts`
3. Remove duplicated properties from specific configs
4. Re-run validation

**Example Fix**:

```typescript
// Before (WRONG)
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000, // ← Should be in base config
  },
});

// After (CORRECT)
// vitest.base.config.ts
export const baseConfig = {
  test: {
    testTimeout: 10000, // ← Now in base config
  },
};

// vitest.config.ts
export default mergeConfig(
  baseConfig,
  defineConfig({
    // Only workspace-specific config here
  })
);
```

### Test Execution Differences

**Problem**: Tests pass with one config but fail with another

**Root Causes**:

1. **Module resolution differences**: Check `resolve.alias` consistency
2. **Timeout differences**: Verify `testTimeout` and `hookTimeout` match
3. **Environment differences**: Ensure `environment` setting is identical
4. **Pool configuration**: May be intentionally different (workspace vs threads)

### Pre-commit Hook Failures

**Problem**: Pre-commit hook blocks commits due to config issues

**Solution**:

```bash
# See what's wrong
node scripts/validate-vitest-configs.js

# Fix the issues, then commit again
git add .
git commit -m "fix: resolve vitest config inconsistencies"
```

## Best Practices

### ✅ DO

- Always edit `vitest.base.config.ts` for shared properties
- Run `pnpm test:config:verify` after config changes
- Use the pull request template checklist for config changes
- Keep config-specific files minimal (only necessary overrides)

### ❌ DON'T

- Duplicate shared properties across configs
- Skip validation after config changes
- Edit multiple config files for the same logical change
- Ignore pre-commit hook failures

## Architecture Rationale

### Why Two Configs?

**Technical Constraint**: Stryker mutation testing doesn't support Vitest workspace mode yet.

**Options Considered**:

1. ✅ **Dual configs with shared base** (chosen)
   - Pros: Maintains both capabilities, safe synchronization
   - Cons: Complexity, requires discipline

2. ❌ **Single config, disable mutation testing**
   - Pros: Simplicity
   - Cons: Loses critical quality gate

3. ❌ **Manual synchronization**
   - Pros: Flexibility
   - Cons: High error rate, configuration drift

### Future Migration Path

When Stryker adds workspace support:

1. Remove `vitest.mutation.config.ts`
2. Move mutation-specific settings to `vitest.workspace.ts`
3. Update CI workflow to use single config
4. Remove dual config validation logic

**Tracking Issue**: TODO link when Stryker workspace support is available

## Reference

### Critical Properties (Must Match)

- `test.globals`
- `test.environment`
- `test.testTimeout`
- `test.hookTimeout`
- `resolve.alias`
- `resolve.extensionAlias`

### Allowed Differences

- `test.workspace`
- `test.include`
- `test.pool`
- `test.poolOptions`

### Validation Script Location

- **Script**: `scripts/validate-vitest-configs.js`
- **Config definitions**: `vitest.base.config.ts` exports `CRITICAL_SYNC_PROPERTIES`
