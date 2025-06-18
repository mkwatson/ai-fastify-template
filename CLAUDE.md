# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Standards

### Architecture Principles
- **Strict TypeScript**: No `any` types allowed - use proper type definitions
- **Runtime Validation**: Use Zod for all validation (env, request bodies, responses)
- **Clean Architecture**: Keep routes thin - business logic goes in services
- **Dependency Rules**: Services should not import from routes or plugins
- **Testability**: Use dependency injection patterns for testability

### Code Standards
- **Strict mode** enabled with `noExplicitAny: "error"`
- All functions must have explicit return types
- Handle null/undefined cases explicitly
- Use `Record<string, never>` for empty object types

### Critical Rules
- **NEVER** access `process.env` directly - use validated env schema
- **NEVER** skip input validation on any public endpoint
- **ALWAYS** validate all user inputs with Zod schemas
- **ALWAYS** implement proper logging with structured data

*For comprehensive patterns and examples, see [docs/AI_GUIDELINES.md](docs/AI_GUIDELINES.md)*

## AI Guidance System Architecture

This project uses a multi-layered AI guidance system designed for maximum code quality and tool optimization:

### 🤖 **CLAUDE.md** (this file)
- **Purpose**: Claude Code specific workflows and permissions
- **Content**: Commands, quality gates, git operations, multi-file editing workflows
- **Usage**: Automatically loaded by Claude Code for project context

### ⚡ **.cursor/rules/** 
- **Purpose**: Context-aware rules for Cursor IDE
- **Content**: Modular rules that activate based on file patterns and context
- **Usage**: 
  - `always.mdc` - Core standards for all files
  - `backend-api.mdc` - Auto-activates when working in apps/backend-api/
  - `testing.mdc` - Auto-activates for test files
  - `architecture.mdc` - Agent-requested for architectural discussions

### 📚 **docs/AI_GUIDELINES.md**
- **Purpose**: Comprehensive enterprise patterns and detailed examples
- **Content**: Advanced error handling, testing strategies, security patterns
- **Usage**: Reference for detailed implementation patterns and troubleshooting

### 🔄 **shared-ai-*.md**
- **Purpose**: Source content to prevent duplication
- **Content**: Core standards, commands, architecture (referenced by other files)
- **Usage**: Single source of truth for shared concepts

### Tool-Specific Usage
- **Claude Code**: Reads CLAUDE.md for workflows + docs/AI_GUIDELINES.md for patterns
- **Cursor**: Automatically loads .cursor/rules/ based on file patterns  
- **Other AI tools**: Use docs/AI_GUIDELINES.md as comprehensive reference

## Development Commands

### Core Development
```bash
# Start development server
pnpm dev                    # Start all apps in development mode

# Build and verification
pnpm build                  # Build all packages
pnpm test                   # Run all test suites
pnpm test:watch             # Run tests in watch mode
pnpm type-check             # TypeScript compilation check
```

### Quality Assurance (backend-api specific)
```bash
cd apps/backend-api
pnpm lint                   # Biome linting and formatting
pnpm test:coverage          # Run tests with coverage
pnpm clean                  # Clean build artifacts
```

### Pre-Commit Workflow
Always run these commands before committing:
```bash
pnpm type-check            # Verify TypeScript compilation
pnpm lint                  # Check formatting and linting
pnpm test                  # Run all tests
pnpm build                 # Verify build succeeds
```

## Project Architecture

### Monorepo Structure
- **apps/**: Deployable applications (currently: `backend-api`)
- **packages/**: Shared libraries (empty, planned for future)
- **pnpm workspaces** with TurboRepo for task caching and parallel execution

### Dependency Rules
- Apps can depend on packages but not other apps
- Packages can depend on other packages but not apps
- Use `@ai-fastify-template/package-name` for internal packages

### Backend API (`apps/backend-api/`)
- **Fastify 5.0** + **TypeScript** with strict configuration
- **Zod** for runtime validation (environment variables and request bodies)
- **Vitest** for testing with coverage reporting
- **Biome** for linting and formatting

### Environment Validation
The `src/plugins/env.ts` uses Zod for comprehensive environment validation:
- Type-safe configuration with custom error messages
- Sensitive data redaction for logging
- Port range validation and detailed error handling

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

For detailed project status and roadmap, see [PROJECT_STATUS.md](PROJECT_STATUS.md).

**Quick Summary:**
- ✅ **Foundation & Backend API**: Production-ready with comprehensive testing
- ✅ **AI Guidance System**: Enterprise-grade optimization complete
- 📋 **Next**: SSE streaming, SDK generation, enhanced features