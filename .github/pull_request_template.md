# Pull Request

## Summary

Brief description of changes and motivation.

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration change
- [ ] 🧪 Test update
- [ ] 🚀 Performance improvement
- [ ] ♻️ Code refactoring

## Testing

- [ ] All existing tests pass (`pnpm ci:check`)
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Configuration Changes (if applicable)

🚨 **CRITICAL**: If you modified any Vitest configuration files:

- [ ] Modified `vitest.base.config.ts` for shared properties only
- [ ] Modified `vitest.config.ts` or `vitest.mutation.config.ts` for config-specific properties only
- [ ] Ran `pnpm test:config:verify` successfully
- [ ] Verified pre-commit hook catches config inconsistencies
- [ ] Updated documentation if configuration behavior changed

**Which configs were modified?**

- [ ] `vitest.base.config.ts` (shared properties)
- [ ] `vitest.config.ts` (workspace configuration)
- [ ] `vitest.mutation.config.ts` (mutation testing configuration)
- [ ] Other test configuration files

## Quality Checklist

- [ ] Code follows project conventions and style guidelines
- [ ] No console.log statements left in production code
- [ ] Error handling is appropriate and follows project patterns
- [ ] TypeScript strict mode compliance maintained
- [ ] All ESLint rules pass without warnings
- [ ] Performance impact considered and documented if significant

## AI Development Notes

- [ ] Changes are compatible with AI coding workflows
- [ ] Documentation updated for AI agents if needed
- [ ] Commands remain predictable and standard

## Breaking Changes

If this is a breaking change, describe:

- What breaks
- Migration steps for users
- Alternatives considered

## Additional Notes

Any additional context, screenshots, or relevant information.
