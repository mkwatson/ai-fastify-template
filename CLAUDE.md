# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Standards
@shared-ai-core.md

## Development Commands
@shared-ai-commands.md

## Project Architecture
@shared-ai-architecture.md

## Claude-Specific Workflows

### Code Generation & Editing
- **Multi-file operations**: Claude can edit multiple files atomically
- **File creation**: Create new files following project patterns
- **Refactoring**: Large-scale refactoring across the codebase
- **Git operations**: Can create commits and manage branches (with permission)

### Command Execution Permissions
Claude is authorized to run these commands when requested:
- `pnpm test` - Run test suites
- `pnpm lint` - Check code formatting
- `pnpm type-check` - Verify TypeScript compilation
- `pnpm build` - Build the project
- `git status` - Check repository status
- `git add .` and `git commit` - Stage and commit changes (with approval)

### Quality Assurance Workflow
When making code changes, Claude should:
1. **Implement the feature/fix**
2. **Run quality checks**: `pnpm type-check && pnpm lint && pnpm test`
3. **Fix any issues** identified by the quality gates
4. **Verify build succeeds**: `pnpm build`
5. **Create descriptive commits** following conventional format

### Branch and PR Management
- **Create feature branches** from latest main
- **Follow naming convention**: `feature/description` or `fix/description`
- **Create PRs** with detailed descriptions including:
  - Summary of changes
  - Testing approach
  - Quality gate verification

### AI Collaboration Best Practices
- **Incremental development**: Make small, focused changes
- **Quality-first approach**: Prioritize passing all quality gates
- **Documentation updates**: Keep docs in sync with code changes
- **Test-driven development**: Write tests before or alongside implementation
- **Architecture respect**: Follow established patterns and boundaries

### Emergency Procedures
If quality gates fail:
1. **Analyze the specific error** from tool output
2. **Fix one issue at a time** rather than batching changes
3. **Re-run quality checks** after each fix
4. **Ask for clarification** if errors are unclear

### Context Management
- **Reference documentation**: Use `docs/AI_GUIDELINES.md` for detailed patterns
- **Check existing code**: Look at similar implementations before creating new ones
- **Verify assumptions**: Check current codebase state before making changes

## Current Project Status
✅ **Foundation**: Monorepo with pnpm + TurboRepo
✅ **Backend API**: Fastify with TypeScript, Zod validation, comprehensive testing
✅ **Quality Tooling**: Biome linting, Vitest testing, strict TypeScript
🔄 **In Progress**: AI guidance optimization, enhanced quality gates
📋 **Planned**: SSE streaming, SDK generation, CI/CD pipeline