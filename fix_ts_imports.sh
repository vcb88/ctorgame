#!/bin/bash

# Fix @/lib/utils imports
find ./client/src -type f -name "*.tsx" -exec sed -i 's/from '"'"'@\/lib\/utils'"'"'/from '"'"'@\/lib\/utils.js'"'"'/g' {} +

# Fix @/utils/logger imports
find ./client/src -type f -name "*.tsx" -exec sed -i 's/from '"'"'@\/utils\/logger'"'"'/from '"'"'@\/utils\/logger.js'"'"'/g' {} +

# Fix @/components/ui/button imports
find ./client/src -type f -name "*.tsx" -exec sed -i 's/from '"'"'@\/components\/ui\/button'"'"'/from '"'"'@\/components\/ui\/button.js'"'"'/g' {} +

# Fix relative imports without extensions
find ./client/src -type f -name "*.tsx" -exec sed -i 's/from '"'"'\.\.\/*\([^'"'"']*\)'"'"'/from '"'"'\.\.\/*\1.js'"'"'/g' {} +

# Fix GameCell imports
find ./client/src -type f -name "*.tsx" -exec sed -i 's/from '"'"'@\/components\/GameCell'"'"'/from '"'"'@\/components\/GameCell.js'"'"'/g' {} +

# Fix cyber-button imports
find ./client/src -type f -name "*.tsx" -exec sed -i 's/from '"'"'@\/components\/ui\/cyber-button'"'"'/from '"'"'@\/components\/ui\/cyber-button.js'"'"'/g' {} +