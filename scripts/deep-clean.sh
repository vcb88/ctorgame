#!/bin/bash

# Remove all build artifacts and dependencies
find . -type d \( \
    -name "node_modules" -o \
    -name "dist" -o \
    -name ".cache" -o \
    -name "build" -o \
    -name "coverage" -o \
    -name ".nyc_output" -o \
    -name ".pnpm-store" \
\) -exec rm -rf {} +

# Remove all TypeScript build info files
find . -name "tsconfig.tsbuildinfo" -type f -delete

# Remove all package lock files to ensure clean dependency installation
find . -name "package-lock.json" -type f -delete
find . -name "pnpm-lock.yaml" -type f -delete

# Remove other common cache directories
rm -rf ~/.pnpm-store
rm -rf ~/.cache/typescript

# Optional: remove IDE specific files that might cache build info
find . -type d -name ".idea" -exec rm -rf {} +
find . -type d -name ".vscode" -exec rm -rf {} +