#!/bin/bash

# Ensure we're in the shared directory
cd "$(dirname "$0")/.." || exit 1

# Function to process a single file
process_file() {
    local file="$1"
    echo "Processing $file..."
    
    # Create a temporary file
    tmp_file=$(mktemp)
    
    # Process the file line by line
    while IFS= read -r line; do
        # Check if line contains an import from a relative path
        if [[ $line =~ ^import[[:space:]]+.*from[[:space:]]+[\"\']\.[\/] ]]; then
            # Add .js extension if not already present
            if [[ ! $line =~ \.js[\"\'] ]]; then
                line="${line%[\"\']}\".js\""
            fi
        fi
        echo "$line" >> "$tmp_file"
    done < "$file"
    
    # Replace original file with processed file
    mv "$tmp_file" "$file"
}

# Find and process all TypeScript files
find src -type f -name "*.ts" | while read -r file; do
    if [[ ! "$file" =~ node_modules ]]; then
        process_file "$file"
    fi
done