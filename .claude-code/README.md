# Claude Code Hooks Configuration

This directory contains the Claude Code hooks configuration that enhances AI-assisted development by providing immediate feedback and enforcing project standards.

## Overview

The hooks in `settings.json` implement a "Fourth Layer" of defense that complements our Three-Layer Defense System:

1. **Immediate Feedback** (Claude Code hooks) - Catches issues within seconds
2. **During Development** (manual/watch commands) - Developer-initiated validation
3. **Before Commit** (Husky pre-commit) - Automatic validation before commits
4. **Before Push** (Husky pre-push) - Final validation matching CI

## Hook Types

### 🔄 PostToolUse Hooks

#### 1. **Validation Hook** (Edit|Write|MultiEdit)

- Runs `pnpm ai:quick` with a 10-second timeout after code changes
- Shows specific errors/warnings when validation fails
- Non-blocking to maintain development flow

#### 2. **Consolidated File Processing** (Edit|Write)

- **Prettier Formatting**: Auto-formats TypeScript/JavaScript files
- **Utils Alert**: Notifies when business logic requires mutation testing
- **Test Quality Reminder**: Ensures tests validate logic, not just coverage
- Skips generated/vendor files for performance

#### 3. **Command Logging** (Bash)

- Records all executed commands for audit trails and debugging

### 🔒 PreToolUse Hooks

#### 1. **Secrets Protection** (Edit|Write)

- Blocks direct modification of:
  - `.env` files and environment configurations
  - Files in `secrets/`, `credentials/`, `private/`, or `keys/` directories
  - Paths containing `../` (path traversal attempts)
- Uses `realpath` to resolve symlinks and prevent bypass attempts

#### 2. **System Directory Protection** (Write)

- Prevents writes to:
  - `node_modules/` - Package installations
  - `dist/`, `build/` - Build outputs
  - `coverage/` - Test coverage reports
  - `.git/` - Git internals
  - `.nx/`, `.turbo/` - Build system caches
- Blocks modification of symlinks

### 📊 Stop Hooks

1. **Session Summary**: Shows git status and recent changes
2. **Next Steps Guide**: Provides actionable commands when changes are pending
3. **Command History**: Displays last 5 commands executed in the session

### 🔔 Notification Hooks

- Logs all notifications with timestamps for debugging and monitoring

## Security Model

### Defense in Depth

1. **Path Resolution**: All file paths are resolved to absolute paths using `realpath`
2. **Pattern Matching**: Multiple regex patterns catch various bypass attempts
3. **Symlink Detection**: Explicit checks for symbolic links
4. **Exit Codes**: Security blocks use `exit 1` to halt operations

### Protected Patterns

- **Environment Files**: `*.env`, `*.secret`, `.env.*`
- **Sensitive Directories**: `/secrets/`, `/credentials/`, `/private/`, `/keys/`
- **System Directories**: `/node_modules/`, `/dist/`, `/.git/`, etc.
- **Path Traversal**: Any path containing `../`

## Performance Considerations

### Optimizations

1. **Consolidated Hooks**: Multiple file checks combined into single hook
2. **Early Exit**: Skip processing for generated/vendor files
3. **Timeout Protection**: 10-second timeout prevents hanging validations
4. **Selective Validation**: Only validates changed files, not entire project

### Expected Overhead

- **Per Edit**: 1-2 seconds for validation + formatting
- **Validation Timeout**: Maximum 10 seconds (rare)
- **Security Checks**: <100ms (filesystem operations)

## Troubleshooting

### Common Issues

1. **"Validation issues detected"**
   - Run `pnpm lint:fix` to auto-fix formatting
   - Check `pnpm ai:quick` output for specific errors

2. **"BLOCKED: Direct env/secrets modification"**
   - Use Zod schemas in `packages/config` for environment validation
   - Never commit secrets to the repository

3. **Hooks not running**
   - Ensure Claude Code is updated to latest version
   - Check that `settings.json` is valid JSON
   - Verify working directory is project root

### Debugging

1. **View command history**: Check `$SESSION_TRANSCRIPT_PATH.commands.log`
2. **Test hooks manually**: Export required variables and run commands
3. **Disable temporarily**: Comment out specific hooks in `settings.json`

## Maintenance

### Adding New Hooks

1. Follow existing patterns for consistency
2. Test hooks thoroughly before committing
3. Document any new patterns or behaviors
4. Consider performance impact

### Validation

Run the validation script to ensure hooks remain compatible:

```bash
pnpm claude:validate
```

This checks:

- All referenced scripts exist in package.json
- File patterns match project structure
- Security patterns are comprehensive
- No performance regressions

## Integration with AI Agents

These hooks are designed to work seamlessly with AI coding assistants by:

1. **Providing immediate feedback** without interrupting generation
2. **Teaching patterns** through consistent messages
3. **Preventing common mistakes** before they propagate
4. **Maintaining audit trails** for learning and debugging

The hooks complement but don't replace human judgment and the existing validation pipeline.

## Metrics & Learning

See [METRICS.md](./METRICS.md) for details on the privacy-first metrics collection plan that will help improve AI coding patterns over time.
