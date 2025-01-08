#!/bin/bash

# Function to update imports in a file
update_imports() {
    local file=$1
    echo "Updating imports in $file"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Replace imports from @ctor-game/shared/types with @ctor-game/shared
    sed 's/@ctor-game\/shared\/types/@ctor-game\/shared/g' "$file" > "$temp_file"
    
    # Replace other shared imports if needed
    sed -i 's/@ctor-game\/shared\/validation/@ctor-game\/shared/g' "$temp_file"
    
    # Move the temporary file back
    mv "$temp_file" "$file"
}

# Find all TypeScript files in src directory
find client/src -type f -name "*.ts*" | while read -r file; do
    if grep -q "@ctor-game/shared/" "$file"; then
        update_imports "$file"
    fi
done

echo "Import updates completed"