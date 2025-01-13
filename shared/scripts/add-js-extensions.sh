#!/bin/bash

# Ensure we're in the shared directory
cd "$(dirname "$0")/.." || exit 1

# Find all TypeScript files in src directory
find src -type f -name "*.ts" | while read -r file; do
    # Skip index.ts files and files in node_modules
    if [[ $file == */index.ts ]] || [[ $file == */node_modules/* ]]; then
        continue
    fi
    
    # Add .js extension to relative imports
    sed -i 's/from "\([\.\/]\+[^"]*\)"/from "\1.js"/g' "$file"
done