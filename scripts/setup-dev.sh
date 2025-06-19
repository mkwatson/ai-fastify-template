#!/bin/bash

# AI Fastify Template - Development Environment Setup
# This script automates the setup process for new developers

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_node() {
    log_info "Checking Node.js installation..."
    
    if ! command_exists node; then
        log_error "Node.js is not installed!"
        log_info "Please install Node.js >= 18.0.0 from https://nodejs.org/"
        exit 1
    fi
    
    local node_version
    node_version=$(node --version | sed 's/v//')
    local major_version
    major_version=$(echo "$node_version" | cut -d. -f1)
    
    if [ "$major_version" -lt 18 ]; then
        log_error "Node.js version $node_version is too old!"
        log_info "Please install Node.js >= 18.0.0"
        exit 1
    fi
    
    log_success "Node.js $node_version is installed"
}

# Check pnpm installation
check_pnpm() {
    log_info "Checking pnpm installation..."
    
    if ! command_exists pnpm; then
        log_warning "pnpm is not installed. Installing..."
        
        if command_exists corepack; then
            log_info "Using corepack to enable pnpm..."
            corepack enable
            corepack prepare pnpm@latest --activate
        else
            log_info "Installing pnpm via npm..."
            npm install -g pnpm
        fi
    fi
    
    local pnpm_version
    pnpm_version=$(pnpm --version)
    log_success "pnpm $pnpm_version is installed"
}

# Check Python installation for pre-commit
check_python() {
    log_info "Checking Python installation for pre-commit hooks..."
    
    if command_exists python3; then
        local python_version
        python_version=$(python3 --version | cut -d' ' -f2)
        log_success "Python $python_version is installed"
    elif command_exists python; then
        local python_version
        python_version=$(python --version | cut -d' ' -f2)
        log_success "Python $python_version is installed"
    else
        log_warning "Python is not installed!"
        log_info "Pre-commit hooks require Python >= 3.8"
        log_info "Install from: https://python.org/downloads/"
        log_info "Or on macOS: brew install python"
        log_info "Continuing without pre-commit hooks..."
        return 1
    fi
    return 0
}

# Install pre-commit
install_precommit() {
    log_info "Installing pre-commit framework..."
    
    if command_exists pipx; then
        log_info "Using pipx to install pre-commit (isolated)..."
        pipx install pre-commit
    elif command_exists pip3; then
        log_info "Using pip3 to install pre-commit..."
        pip3 install pre-commit
    elif command_exists pip; then
        log_info "Using pip to install pre-commit..."
        pip install pre-commit
    else
        log_error "No pip installer found!"
        log_info "Please install Python package manager"
        return 1
    fi
    
    # Verify installation
    if command_exists pre-commit; then
        local precommit_version
        precommit_version=$(pre-commit --version)
        log_success "pre-commit $precommit_version installed"
        return 0
    else
        log_error "pre-commit installation failed!"
        return 1
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    pnpm install
    log_success "Dependencies installed"
}

# Setup pre-commit hooks
setup_hooks() {
    log_info "Setting up pre-commit hooks..."
    
    if command_exists pre-commit; then
        pnpm hooks:install
        log_success "Pre-commit hooks installed"
        
        # Test hooks
        log_info "Testing pre-commit hooks..."
        if pnpm hooks:run; then
            log_success "Pre-commit hooks are working correctly"
        else
            log_warning "Pre-commit hooks test failed - may need manual fixes"
        fi
    else
        log_warning "Skipping pre-commit hooks setup (pre-commit not available)"
    fi
}

# Verify setup
verify_setup() {
    log_info "Verifying development environment setup..."
    
    # Check if build works
    log_info "Testing build process..."
    if pnpm build --dry-run 2>/dev/null || pnpm turbo build --dry-run 2>/dev/null; then
        log_success "Build configuration is valid"
    else
        log_warning "Build test skipped (no --dry-run support)"
    fi
    
    # Check TypeScript
    log_info "Testing TypeScript configuration..."
    if pnpm type-check; then
        log_success "TypeScript configuration is valid"
    else
        log_warning "TypeScript check failed - may need manual fixes"
    fi
    
    # Check linting
    log_info "Testing ESLint + Prettier configuration..."
    if pnpm lint; then
        log_success "ESLint + Prettier configuration is valid"
    else
        log_warning "Linting check failed - may need manual fixes"
    fi
}

# Print success message
print_success() {
    echo
    log_success "🎉 Development environment setup complete!"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Start development server: ${GREEN}pnpm dev${NC}"
    echo "  2. Run tests: ${GREEN}pnpm test${NC}"
    echo "  3. Check code quality: ${GREEN}pnpm ai:quick${NC}"
    echo "  4. Full validation: ${GREEN}pnpm validate:commit${NC}"
    echo
    echo -e "${BLUE}Useful commands:${NC}"
    echo "  • ${GREEN}pnpm hooks:run${NC}        - Run pre-commit hooks manually"
    echo "  • ${GREEN}pnpm ai:compliance${NC}    - Full quality check"
    echo "  • ${GREEN}git commit --no-verify${NC} - Bypass hooks (emergency only)"
    echo
    echo -e "${BLUE}Documentation:${NC}"
    echo "  • README.md          - Project overview and quick start"
    echo "  • docs/DEVELOPMENT.md - Development workflow"
    echo "  • docs/TROUBLESHOOTING.md - Common issues and solutions"
    echo
}

# Main execution
main() {
    echo -e "${BLUE}🚀 AI Fastify Template - Development Environment Setup${NC}"
    echo "=================================================="
    echo
    
    # Check prerequisites
    check_node
    check_pnpm
    
    # Check Python (optional for pre-commit)
    python_available=false
    if check_python; then
        python_available=true
    fi
    
    # Install dependencies
    install_dependencies
    
    # Setup pre-commit if Python is available
    if [ "$python_available" = true ]; then
        if ! command_exists pre-commit; then
            install_precommit
        fi
        setup_hooks
    else
        log_warning "Skipping pre-commit hooks setup (Python not available)"
        log_info "You can install them later with: pnpm hooks:install"
    fi
    
    # Verify everything works
    verify_setup
    
    # Success message
    print_success
}

# Handle errors gracefully
trap 'log_error "Setup failed! Check the error messages above."' ERR

# Run main function
main "$@" 