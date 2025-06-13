# Contributing to AI Fastify Template

Thank you for your interest in contributing! This document provides guidelines for contributing to the AI Fastify Template project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Quality Standards](#quality-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [AI Agent Guidelines](#ai-agent-guidelines)

## Code of Conduct

This project follows a professional, inclusive environment. Please:

- Be respectful and constructive in all interactions
- Focus on technical merit and project goals
- Help maintain a welcoming community for all contributors
- Report any unacceptable behavior to the maintainers

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-fastify-template.git
   cd ai-fastify-template
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Verify setup**
   ```bash
   pnpm build --dry-run
   pnpm lint
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Project Structure

```
ai-fastify-template/
├── apps/                    # Deployable applications
├── packages/                # Shared libraries
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
└── .github/                 # GitHub workflows
```

### Adding New Features

1. **Create appropriate structure**
   ```bash
   # For new app
   mkdir apps/my-app
   cd apps/my-app
   pnpm init
   
   # For new package
   mkdir packages/my-package
   cd packages/my-package
   pnpm init
   ```

2. **Follow naming conventions**
   - Apps: `kebab-case` (e.g., `backend-api`, `admin-dashboard`)
   - Packages: `@ai-fastify-template/package-name`
   - Files: `kebab-case.ts` or `camelCase.ts` for components

3. **Add dependencies correctly**
   ```bash
   # App-specific dependency
   pnpm add --filter my-app fastify
   
   # Workspace-wide dev dependency
   pnpm add -Dw typescript
   
   # Package dependency
   pnpm add --filter @ai-fastify-template/my-package zod
   ```

### Architecture Guidelines

#### Apps Directory
- **Purpose**: Deployable applications
- **Dependencies**: Can depend on packages, not other apps
- **Structure**: Keep thin, delegate logic to packages
- **Example**: REST API, GraphQL server, CLI tool

#### Packages Directory
- **Purpose**: Shared, reusable code
- **Dependencies**: Can depend on other packages
- **Structure**: Single responsibility, clear interfaces
- **Example**: Database client, validation schemas, utilities

#### Dependency Rules
- Apps → Packages ✅
- Packages → Packages ✅
- Apps → Apps ❌
- Packages → Apps ❌

## Quality Standards

### Code Quality

All contributions must pass the available quality checks:

```bash
# Currently available
pnpm build          # Build all packages
pnpm lint           # Code formatting and style

# Coming with backend development (MAR-11+)
pnpm test           # Unit and integration tests
pnpm type-check     # TypeScript compilation
```

### TypeScript Standards

- **Strict mode**: All TypeScript must compile in strict mode
- **No `any` types**: Use proper typing or `unknown` with type guards
- **Explicit return types**: For public functions and methods
- **Proper imports**: Use explicit imports, avoid barrel exports

```typescript
// ✅ Good
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad
export function calculateTotal(items: any): any {
  return items.reduce((sum: any, item: any) => sum + item.price, 0);
}
```

### Testing Standards

- **Unit tests**: For all business logic
- **Integration tests**: For API endpoints and external integrations
- **Test coverage**: Aim for >90% coverage
- **Mutation testing**: When available, maintain >90% mutation score

```typescript
// Test structure
describe('Feature', () => {
  describe('when condition', () => {
    it('should behave correctly', () => {
      // Arrange
      const input = createTestInput();
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

### Documentation Standards

- **README**: Update if adding new features or changing setup
- **Code comments**: For complex business logic only
- **JSDoc**: For public APIs and exported functions
- **Architecture decisions**: Document in `docs/ARCHITECTURE.md`

## Commit Guidelines

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(api): add user authentication endpoint"

# Bug fix
git commit -m "fix(validation): handle empty string in email validator"

# Documentation
git commit -m "docs: update contributing guidelines"

# Breaking change
git commit -m "feat(api)!: change user ID from number to UUID

BREAKING CHANGE: User IDs are now UUIDs instead of numbers"
```

### Commit Best Practices

- **Atomic commits**: One logical change per commit
- **Clear messages**: Describe what and why, not how
- **Reference issues**: Include issue numbers when applicable
- **Test before commit**: Ensure all quality checks pass

## Pull Request Process

### Before Submitting

1. **Ensure quality checks pass**
   ```bash
   pnpm build
   pnpm lint
   
   # Coming with MAR-11+: Full pipeline
   # pnpm test
   # pnpm type-check
   ```

2. **Update documentation**
   - README if adding features
   - JSDoc for new public APIs
   - Architecture docs for significant changes

3. **Add tests**
   - Unit tests for new functions
   - Integration tests for new endpoints
   - Update existing tests if behavior changes

### PR Description Template

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
- [ ] No breaking changes (or properly documented)
```

### Review Process

1. **Automated checks**: All CI checks must pass
2. **Code review**: At least one maintainer approval required
3. **Testing**: Verify tests cover new functionality
4. **Documentation**: Ensure docs are updated appropriately

## AI Agent Guidelines

This project is optimized for AI-assisted development. When working with AI agents:

### Effective Prompts

```
✅ Good: "Add a new route that validates the request body with Zod and follows the existing error handling patterns"

❌ Bad: "Add a route" (too vague, likely to skip validation)
```

### AI-Friendly Patterns

- **Explicit types**: Help AI understand expected shapes
- **Clear interfaces**: Define contracts between modules
- **Consistent patterns**: Follow established conventions
- **Comprehensive tests**: Help AI understand expected behavior

### When AI Gets Stuck

1. **Check build output**: `pnpm build` and `pnpm lint`
2. **Look for specific errors**: Focus on one constraint at a time
3. **Reference existing patterns**: Point AI to similar implementations
4. **Break down requests**: Smaller, focused changes work better

## Getting Help

- **Documentation**: Check `docs/` directory first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Maintainers**: Tag maintainers for urgent issues only

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project documentation for major features

Thank you for contributing to AI Fastify Template! 🚀 