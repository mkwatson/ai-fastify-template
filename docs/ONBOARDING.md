# Developer Onboarding Checklist

Welcome to the AI Fastify Template project! This guide will help you get up and running quickly with our development environment.

## 🎯 Overview

This project is an **enterprise-grade Fastify template** optimized for AI-assisted development. It includes comprehensive quality gates, automated workflows, and extensive documentation to enable productive development with AI coding assistants.

## ✅ Pre-Setup Requirements

Before you begin, ensure you have these installed:

### Required Dependencies
- [ ] **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- [ ] **Git** ([Download](https://git-scm.com/downloads))
- [ ] **Python** >= 3.8 ([Download](https://python.org/downloads/)) - for pre-commit hooks

### Optional but Recommended
- [ ] **VS Code** or your preferred editor with TypeScript support
- [ ] **pnpm** (will be installed automatically if missing)
- [ ] **pre-commit** framework (will be installed automatically)

## 🚀 Quick Setup (Automated)

The fastest way to get started:

```bash
# 1. Clone the repository
git clone https://github.com/mkwatson/ai-fastify-template.git
cd ai-fastify-template

# 2. Run automated setup
pnpm setup:dev

# OR use the setup script directly
./scripts/setup-dev.sh
```

This will automatically:
- ✅ Install dependencies
- ✅ Setup pre-commit hooks
- ✅ Verify environment
- ✅ Run initial quality checks

## 📋 Manual Setup (Step by Step)

If you prefer manual setup or the automated setup fails:

### Step 1: Install Dependencies
```bash
# Install project dependencies
pnpm install

# Verify installation
pnpm --version
```

### Step 2: Setup Pre-commit Hooks
```bash
# Install pre-commit framework (if not already installed)
pip3 install pre-commit

# Install git hooks
pnpm hooks:install

# Test hooks
pnpm hooks:run
```

### Step 3: Verify Setup
```bash
# Check TypeScript configuration
pnpm type-check

# Check code quality
pnpm lint

# Run all quality gates
pnpm ai:compliance
```

## 🧪 Validate Your Setup

Run these commands to ensure everything is working:

### Basic Validation
- [ ] `pnpm --version` - Shows pnpm version
- [ ] `pnpm type-check` - No TypeScript errors
- [ ] `pnpm lint` - No linting errors
- [ ] `pnpm test` - All tests pass
- [ ] `pnpm build` - Builds successfully

### Pre-commit Hooks Validation
- [ ] `pre-commit --version` - Shows pre-commit version
- [ ] `pnpm hooks:run` - All hooks pass
- [ ] Try a test commit: `git commit --allow-empty -m "test: validate hooks"`

### Development Server
- [ ] `pnpm dev` - Development server starts
- [ ] Visit `http://localhost:3000` - Returns "Hello World"
- [ ] API responds correctly

## 📚 Essential Knowledge

### Project Structure
```
ai-fastify-template/
├── apps/backend-api/     # Main Fastify application
├── docs/                 # Documentation
├── scripts/             # Automation scripts
├── .pre-commit-config.yaml  # Quality gate configuration
├── eslint.config.js     # Linting rules
├── turbo.json          # Build pipeline
└── package.json        # Project configuration
```

### Quality Gates Overview
Every commit automatically runs:
- 🔒 **GitLeaks** - Credential scanning
- 🎨 **ESLint + Prettier** - Code formatting and linting
- 🔷 **TypeScript** - Type checking
- 📝 **Conventional Commits** - Commit message validation
- 📏 **File Hygiene** - File size, format validation
- 🛡️ **Security Audit** - Dependency vulnerability scanning

### Key Commands
```bash
# Development
pnpm dev              # Start development server
pnpm test             # Run tests
pnpm build            # Build application

# Quality
pnpm lint             # Check code quality
pnpm lint:fix         # Auto-fix issues
pnpm ai:quick         # Fast quality check
pnpm ai:compliance    # Full compliance check

# Pre-commit Hooks
pnpm hooks:run        # Run hooks manually
pnpm hooks:update     # Update hook versions
pnpm validate:commit  # Complete validation
```

## 🔄 Development Workflow

### Daily Development
1. **Start development server**: `pnpm dev`
2. **Make your changes** in `apps/backend-api/src/`
3. **Test your changes**: `pnpm test`
4. **Commit with quality gates**: `git commit -m "feat(scope): description"`

### Before Creating PR
1. **Run full validation**: `pnpm validate:commit`
2. **Ensure all tests pass**: `pnpm test`
3. **Check for TypeScript errors**: `pnpm type-check`
4. **Verify build works**: `pnpm build`

### Commit Message Format
We use **conventional commits**:
```bash
# Format: type(scope): description
feat(api): add user authentication endpoint
fix(hooks): resolve validation issue
docs(readme): update installation guide
test(api): add endpoint validation tests
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

## 🛠 IDE Setup

### VS Code (Recommended)
Install these extensions:
- [ ] **TypeScript** (built-in)
- [ ] **ESLint** (dbaeumer.vscode-eslint)
- [ ] **Prettier** (esbenp.prettier-vscode)
- [ ] **GitLens** (eamodio.gitlens)

### Settings
Add to your VS Code `settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.noSemicolons": false
}
```

## 🚨 Common Issues

### Pre-commit Hooks Not Running
```bash
# Reinstall hooks
pnpm hooks:install

# Check hook status
ls -la .git/hooks/
```

### Python/pre-commit Issues
```bash
# Install pre-commit differently
pip3 install --user pre-commit
# OR
brew install pre-commit  # macOS
```

### TypeScript Errors
```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm type-check
```

For more issues, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📖 Learning Resources

### Project Documentation
- [ ] Read [README.md](../README.md) - Project overview
- [ ] Read [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [ ] Read [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [ ] Read [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

### External Resources
- [Fastify Documentation](https://fastify.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://conventionalcommits.org/)
- [Pre-commit Framework](https://pre-commit.com/)

## ✨ Advanced Features

Once you're comfortable with the basics:

### AI-Assisted Development
- This template is optimized for AI coding assistants
- Quality gates catch AI-generated errors early
- Clear architectural boundaries guide AI toward correct patterns

### Monorepo Structure
- Uses pnpm workspaces + TurboRepo
- Shared packages in `packages/` (planned)
- Independent applications in `apps/`

### Quality Automation
- Pre-commit hooks run on every commit
- CI/CD pipeline validates all changes
- Comprehensive testing with mutation testing (planned)

## 🎉 You're Ready!

Once you've completed this checklist, you're ready to start contributing! 

### Next Steps
1. **Pick an issue** from the GitHub issues
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** following the development workflow
4. **Submit a Pull Request**

### Getting Help
- 💬 **Ask questions** in GitHub Discussions
- 🐛 **Report issues** in GitHub Issues  
- 📚 **Check documentation** in the `docs/` folder
- 🔍 **Search existing issues** before creating new ones

Welcome to the team! 🚀 