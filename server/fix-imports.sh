#!/bin/bash

# Add .js extension to relative imports
find src -type f -name "*.ts" -exec sed -i 's/from '\''\.\.\/\([^'"'"']*\)'\''/from '"'"'..\/\1.js'"'"'/g' {} +
find src -type f -name "*.ts" -exec sed -i 's/from '\''\.\/\([^'"'"']*\)'\''/from '"'".\/\1.js"'"'/g' {} +

# Don't add extensions to package imports
find src -type f -name "*.ts" -exec sed -i 's/\.js'"'"'$/'\''/g' {} +