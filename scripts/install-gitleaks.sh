#!/usr/bin/env bash
set -euo pipefail

# GitLeaks Enterprise Installation Script
# Ensures GitLeaks is available for security scanning across all platforms
# Part of the enterprise-grade security infrastructure

readonly GITLEAKS_VERSION="8.18.0"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ANSI color codes for enhanced logging
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions for consistent output
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
    echo -e "${RED}❌ $1${NC}" >&2
}

# Check if GitLeaks is already installed and up to date
check_existing_installation() {
    if command -v gitleaks &> /dev/null; then
        local installed_version
        installed_version=$(gitleaks version 2>/dev/null | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "unknown")
        
        if [[ "$installed_version" == "v$GITLEAKS_VERSION" ]]; then
            log_success "GitLeaks v$GITLEAKS_VERSION is already installed and up to date"
            return 0
        elif [[ "$installed_version" != "unknown" ]]; then
            log_warning "GitLeaks $installed_version is installed but v$GITLEAKS_VERSION is recommended"
            log_info "Proceeding with installation of recommended version..."
        fi
    fi
    return 1
}

# Detect the operating system and architecture
detect_platform() {
    local os arch
    
    case "$(uname -s)" in
        Darwin*)  os="darwin" ;;
        Linux*)   os="linux" ;;
        MINGW*|MSYS*|CYGWIN*) os="windows" ;;
        *) 
            log_error "Unsupported operating system: $(uname -s)"
            exit 1
            ;;
    esac
    
    case "$(uname -m)" in
        x86_64|amd64) arch="x64" ;;
        arm64|aarch64) arch="arm64" ;;
        i386|i686) arch="x32" ;;
        *)
            log_error "Unsupported architecture: $(uname -m)"
            exit 1
            ;;
    esac
    
    echo "${os}_${arch}"
}

# Install GitLeaks via package manager (preferred method)
install_via_package_manager() {
    log_info "Attempting installation via package manager..."
    
    if command -v brew &> /dev/null; then
        log_info "Installing GitLeaks via Homebrew..."
        if brew install gitleaks; then
            log_success "GitLeaks installed successfully via Homebrew"
            return 0
        else
            log_warning "Homebrew installation failed, falling back to binary download"
        fi
    elif command -v apt-get &> /dev/null && [[ -n "${DEBIAN_FRONTEND:-}" || -f /etc/debian_version ]]; then
        log_info "Installing GitLeaks via apt (Ubuntu/Debian)..."
        if sudo apt-get update && sudo apt-get install -y gitleaks; then
            log_success "GitLeaks installed successfully via apt"
            return 0
        else
            log_warning "APT installation failed, falling back to binary download"
        fi
    elif command -v yum &> /dev/null; then
        log_info "Installing GitLeaks via yum (RHEL/CentOS)..."
        if sudo yum install -y gitleaks; then
            log_success "GitLeaks installed successfully via yum"
            return 0
        else
            log_warning "YUM installation failed, falling back to binary download"
        fi
    elif command -v dnf &> /dev/null; then
        log_info "Installing GitLeaks via dnf (Fedora)..."
        if sudo dnf install -y gitleaks; then
            log_success "GitLeaks installed successfully via dnf"
            return 0
        else
            log_warning "DNF installation failed, falling back to binary download"
        fi
    fi
    
    return 1
}

# Download and install GitLeaks binary directly from GitHub releases
install_via_binary_download() {
    local platform archive_name download_url temp_dir
    
    platform=$(detect_platform)
    archive_name="gitleaks_${GITLEAKS_VERSION}_${platform}"
    
    # Handle different archive formats by platform
    case "$platform" in
        windows_*) archive_name="${archive_name}.zip" ;;
        *) archive_name="${archive_name}.tar.gz" ;;
    esac
    
    download_url="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/${archive_name}"
    temp_dir=$(mktemp -d)
    
    log_info "Downloading GitLeaks v$GITLEAKS_VERSION for $platform..."
    log_info "Download URL: $download_url"
    
    # Download with progress and error handling
    if ! curl -fsSL --progress-bar "$download_url" -o "$temp_dir/$archive_name"; then
        log_error "Failed to download GitLeaks from $download_url"
        log_error "Please check your internet connection and try again"
        rm -rf "$temp_dir"
        exit 1
    fi
    
    log_info "Extracting GitLeaks binary..."
    
    # Extract based on archive format
    case "$archive_name" in
        *.tar.gz)
            if ! tar -xzf "$temp_dir/$archive_name" -C "$temp_dir"; then
                log_error "Failed to extract tar.gz archive"
                rm -rf "$temp_dir"
                exit 1
            fi
            ;;
        *.zip)
            if ! unzip -q "$temp_dir/$archive_name" -d "$temp_dir"; then
                log_error "Failed to extract zip archive"
                rm -rf "$temp_dir"
                exit 1
            fi
            ;;
    esac
    
    # Find the extracted binary
    local binary_name="gitleaks"
    if [[ "$platform" == windows_* ]]; then
        binary_name="gitleaks.exe"
    fi
    
    local binary_path="$temp_dir/$binary_name"
    if [[ ! -f "$binary_path" ]]; then
        log_error "GitLeaks binary not found in extracted archive"
        ls -la "$temp_dir"
        rm -rf "$temp_dir"
        exit 1
    fi
    
    # Install to appropriate location
    local install_dir
    if [[ "$EUID" -eq 0 ]] || [[ -w "/usr/local/bin" ]]; then
        install_dir="/usr/local/bin"
    elif [[ -d "$HOME/.local/bin" ]]; then
        install_dir="$HOME/.local/bin"
        # Ensure it's in PATH
        if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
            log_warning "Add $HOME/.local/bin to your PATH to use GitLeaks globally"
        fi
    else
        mkdir -p "$HOME/.local/bin"
        install_dir="$HOME/.local/bin"
        log_warning "Created $HOME/.local/bin - add it to your PATH to use GitLeaks globally"
    fi
    
    log_info "Installing GitLeaks to $install_dir..."
    
    if [[ "$install_dir" == "/usr/local/bin" ]] && [[ "$EUID" -ne 0 ]]; then
        if ! sudo cp "$binary_path" "$install_dir/gitleaks"; then
            log_error "Failed to install GitLeaks to $install_dir (permission denied)"
            rm -rf "$temp_dir"
            exit 1
        fi
        sudo chmod +x "$install_dir/gitleaks"
    else
        if ! cp "$binary_path" "$install_dir/gitleaks"; then
            log_error "Failed to install GitLeaks to $install_dir"
            rm -rf "$temp_dir"
            exit 1
        fi
        chmod +x "$install_dir/gitleaks"
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
    
    log_success "GitLeaks v$GITLEAKS_VERSION installed successfully to $install_dir"
}

# Verify the installation
verify_installation() {
    log_info "Verifying GitLeaks installation..."
    
    if ! command -v gitleaks &> /dev/null; then
        log_error "GitLeaks installation verification failed - command not found"
        log_error "Please ensure the installation directory is in your PATH"
        exit 1
    fi
    
    local version
    version=$(gitleaks version 2>/dev/null | head -1 || echo "Version check failed")
    
    log_success "GitLeaks installation verified successfully"
    log_info "Installed version: $version"
    log_info "Location: $(command -v gitleaks)"
}

# Test GitLeaks functionality
test_gitleaks() {
    log_info "Testing GitLeaks functionality..."
    
    # Create a temporary test directory with a dummy secret
    local test_dir
    test_dir=$(mktemp -d)
    
    # Create a test file with a fake secret (harmless for testing)
    cat > "$test_dir/test.txt" << 'EOF'
# This is a test file for GitLeaks validation
export API_KEY=sk-test-1234567890abcdef
EOF
    
    # Run GitLeaks on the test directory (expect it to find the fake secret)
    if gitleaks detect --source="$test_dir" --no-git --quiet; then
        log_warning "GitLeaks test: No secrets detected (unexpected for test file)"
    else
        log_success "GitLeaks test: Successfully detected test secret"
    fi
    
    # Cleanup
    rm -rf "$test_dir"
    
    log_success "GitLeaks functionality test completed"
}

# Main installation function
main() {
    echo "🔒 GitLeaks Enterprise Installation"
    echo "=================================="
    echo
    
    # Check if already installed and up to date
    if check_existing_installation; then
        verify_installation
        test_gitleaks
        return 0
    fi
    
    log_info "Installing GitLeaks v$GITLEAKS_VERSION for enterprise security scanning..."
    
    # Try package manager first, fall back to binary download
    if ! install_via_package_manager; then
        log_info "Package manager installation not available, using binary download..."
        install_via_binary_download
    fi
    
    # Verify and test the installation
    verify_installation
    test_gitleaks
    
    echo
    log_success "GitLeaks installation completed successfully!"
    log_info "GitLeaks is now ready for enterprise security scanning"
    echo
}

# Handle script interruption gracefully
trap 'log_error "Installation interrupted"; exit 130' INT TERM

# Only run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi