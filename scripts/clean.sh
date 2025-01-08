#!/bin/bash

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    case $color in
        "green") echo -e "\033[0;32m$message\033[0m" ;;
        "red") echo -e "\033[0;31m$message\033[0m" ;;
        "yellow") echo -e "\033[0;33m$message\033[0m" ;;
        *) echo "$message" ;;
    esac
}

# Function to handle errors
handle_error() {
    print_message "red" "Error: $1"
    exit 1
}

# Store the current directory
ROOT_DIR=$(pwd)

print_message "yellow" "Starting cleanup process..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    handle_error "pnpm is not installed. Please install pnpm first: npm install -g pnpm"
fi

# Clean build artifacts
print_message "green" "Cleaning build artifacts..."
find . -type d \( -name "dist" -o -name ".vite" -o -name "build" -o -name ".next" -o -name ".nuxt" -o -name ".output" \) -exec rm -rf {} + || handle_error "Failed to clean build artifacts"

# Clean node_modules
print_message "green" "Cleaning node_modules..."
find . -type d -name "node_modules" -exec rm -rf {} + || handle_error "Failed to clean node_modules"

# Clean lock files
print_message "green" "Cleaning lock files..."
find . -type f -name "pnpm-lock.yaml" -exec rm -f {} + || handle_error "Failed to clean lock files"

# Clean TypeScript build info
print_message "green" "Cleaning TypeScript build info..."
find . -type f -name "tsconfig.tsbuildinfo" -exec rm -f {} + || handle_error "Failed to clean TypeScript build info"

# Clean pnpm store
print_message "green" "Cleaning pnpm store..."
pnpm store prune || handle_error "Failed to clean pnpm store"

print_message "green" "✨ Cleanup completed successfully!"
print_message "yellow" "To rebuild the project, run:"
print_message "yellow" "  pnpm install && pnpm build"
print_message "yellow" "Or use the shortcut:"
print_message "yellow" "  pnpm clean:rebuild"