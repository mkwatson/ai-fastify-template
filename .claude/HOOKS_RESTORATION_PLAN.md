# Claude Code Hooks Restoration Plan

## Overview
Safely restore Claude Code hooks one at a time, testing each after a restart.

## Progress Tracking

- [x] Step 1: Create .claude directory and empty settings.json
- [x] Step 2: Add PostToolUse validation hook (ai:quick)
- [x] Step 3: Test validation hook ✓ Working - runs ai:quick with cooldown
- [ ] Step 4: Add PostToolUse Prettier formatting hook
- [ ] Step 5: Test Prettier hook
- [ ] Step 6: Add PreToolUse env/secrets blocking hook
- [ ] Step 7: Test security hook
- [ ] Step 8: Add PreToolUse system directory protection
- [ ] Step 9: Test directory protection
- [ ] Step 10: Add Bash command logging hook
- [ ] Step 11: Test command logging
- [ ] Step 12: Add Stop session summary hooks
- [ ] Step 13: Test session summary
- [ ] Step 14: Add Notification logging hook
- [ ] Step 15: Test notification logging
- [ ] Step 16: Final validation of all hooks

## Detailed Test Plan

### Step 3: Test PostToolUse Validation Hook
**Status**: Ready to test
**Hook**: Runs `pnpm ai:quick` after Edit/Write/MultiEdit operations
**Test**:
1. Restart Claude Code
2. Edit any TypeScript file (e.g., `apps/backend-api/src/app.ts`)
3. Expected: See validation output (✅ or 💡 with errors/warnings)
4. Edit again within 5 seconds
5. Expected: No validation (cooldown prevents re-run)

### Step 4: Add PostToolUse Prettier Hook
**Hook to add**:
```json
{
  "matcher": "Edit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "cd \"$SESSION_WORKING_DIRECTORY\" && { [[ \"$TOOL_FILE_PATH\" =~ \\.(ts|js|tsx|jsx)$ ]] && ! [[ \"$TOOL_FILE_PATH\" =~ (generated|vendor|node_modules) ]] && pnpm prettier --write \"$TOOL_FILE_PATH\" --log-level=error 2>/dev/null; [[ \"$TOOL_FILE_PATH\" =~ /backend-api/src/utils/ ]] && echo '🧬 Utils modified - mutation testing required (85% threshold)'; [[ \"$TOOL_FILE_PATH\" =~ (/test/|\\.test\\.ts$) ]] && echo '🧪 Test modified - ensure it validates business logic, not just coverage'; true; }"
    }
  ]
}
```

### Step 5: Test Prettier Hook
**Test**:
1. Restart Claude Code
2. Create a poorly formatted JS file: `test-prettier.js`
3. Expected: File auto-formats after save
4. Edit a utils file in `apps/backend-api/src/utils/`
5. Expected: See mutation testing reminder
6. Edit a test file
7. Expected: See test quality reminder

### Step 6: Add PreToolUse Security Hook
**Hook to add**:
```json
"PreToolUse": [
  {
    "matcher": "Edit|Write",
    "hooks": [
      {
        "type": "command",
        "command": "RESOLVED_PATH=$(cd \"$SESSION_WORKING_DIRECTORY\" && realpath -m \"$TOOL_FILE_PATH\" 2>/dev/null || echo \"$TOOL_FILE_PATH\"); if [[ \"$RESOLVED_PATH\" =~ \\.(env|secret) ]] || [[ \"$RESOLVED_PATH\" =~ /(secrets|credentials|private|keys)/ ]] || [[ \"$TOOL_FILE_PATH\" =~ \\.\\. ]]; then echo '🚨 BLOCKED: Direct env/secrets modification - use Zod schemas for env validation' && exit 1; fi"
      }
    ]
  }
]
```

### Step 7: Test Security Hook
**Test**:
1. Restart Claude Code
2. Try to create/edit `.env` file
3. Expected: Operation blocked with security message
4. Try to edit file with path traversal `../../../etc/passwd`
5. Expected: Operation blocked

### Step 8: Add System Directory Protection
**Hook to add** (append to PreToolUse):
```json
{
  "matcher": "Write",
  "hooks": [
    {
      "type": "command",
      "command": "RESOLVED_PATH=$(cd \"$SESSION_WORKING_DIRECTORY\" && realpath -m \"$TOOL_FILE_PATH\" 2>/dev/null || echo \"$TOOL_FILE_PATH\"); if [[ \"$RESOLVED_PATH\" =~ /(node_modules|dist|build|coverage|.git|.nx|.turbo)/ ]] || [[ -L \"$TOOL_FILE_PATH\" ]]; then echo '🚨 BLOCKED: Cannot modify generated/system directories or symlinks' && exit 1; fi"
    }
  ]
}
```

### Step 9: Test Directory Protection
**Test**:
1. Restart Claude Code
2. Try to write to `node_modules/test.js`
3. Expected: Operation blocked
4. Try to write to `.git/config`
5. Expected: Operation blocked

### Step 10: Add Bash Command Logging
**Hook to add** (append to PostToolUse):
```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "echo \"📝 Command: $TOOL_COMMAND\" >> \"$SESSION_TRANSCRIPT_PATH.commands.log\""
    }
  ]
}
```

### Step 11: Test Command Logging
**Test**:
1. Restart Claude Code
2. Run: `ls -la`
3. Run: `pwd`
4. Check log file exists at session transcript path

### Step 12: Add Stop Hooks
**Hook to add**:
```json
"Stop": [
  {
    "hooks": [
      {
        "type": "command",
        "command": "cd \"$SESSION_WORKING_DIRECTORY\" && echo '📊 Session Summary:' && git status --short 2>/dev/null | head -10 && echo '' && git diff --stat 2>/dev/null | tail -5"
      }
    ]
  },
  {
    "hooks": [
      {
        "type": "command",
        "command": "cd \"$SESSION_WORKING_DIRECTORY\" && if git diff --quiet 2>/dev/null; then echo '✅ Working directory clean'; else echo '💡 Next steps:' && echo '  1. pnpm ci:check    # Validate changes' && echo '  2. git add -A      # Stage changes' && echo '  3. git commit      # Commit (hooks will validate)'; fi"
      }
    ]
  },
  {
    "hooks": [
      {
        "type": "command",
        "command": "if [ -f \"$SESSION_TRANSCRIPT_PATH.commands.log\" ]; then echo '' && echo '📜 Commands executed this session:' && tail -5 \"$SESSION_TRANSCRIPT_PATH.commands.log\" | sed 's/^/  /'; fi"
      }
    ]
  }
]
```

### Step 13: Test Session Summary
**Test**:
1. Make some file changes
2. Run a few commands
3. Exit Claude Code
4. Expected: See git status, next steps, and command history

### Step 14: Add Notification Hook
**Hook to add**:
```json
"Notification": [
  {
    "hooks": [
      {
        "type": "command",
        "command": "echo \"[$(date '+%H:%M:%S')] $NOTIFICATION_MESSAGE\" >> \"$SESSION_TRANSCRIPT_PATH.notifications.log\""
      }
    ]
  }
]
```

### Step 15: Test Notification Logging
**Test**:
1. Restart Claude Code
2. Perform actions that trigger notifications
3. Check notification log file

### Step 16: Final Validation
**Test ALL hooks together**:
1. Edit a TypeScript file → validation + prettier
2. Try to edit .env → blocked
3. Run bash commands → logged
4. Edit utils file → mutation reminder
5. Exit session → full summary

## Current Status

**Last completed**: Step 2 - Added PostToolUse validation hook
**Next action**: Restart Claude Code and proceed to Step 3

## Notes
- Each hook must be tested individually before adding the next
- The validation hook has a 5-second cooldown to prevent excessive runs
- All hooks use proper escaping and path resolution for safety
- The original backup is at `.claude/BACKUP_settings.json`