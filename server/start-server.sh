#!/bin/sh

echo "Starting server startup script..."
set -ex

# Print diagnostic information
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PNPM version: $(pnpm --version)"

echo "Step 1: Setting up shared package"
cd /app/shared
echo "Current directory: $(pwd)"
NODE_ENV=development pnpm install --force

echo "Building shared package..."
pnpm run build

echo "Step 2: Setting up server dependencies"
cd /app/server
echo "Current directory: $(pwd)"
NODE_ENV=development pnpm install --force

echo "Checking shared build:"
ls -la ../shared/dist/ || echo "No shared/dist directory found"
echo "Step 3: Checking TypeScript compilation"
pnpm run type-check

echo "Step 4: Verifying index.ts exists"
if [ ! -f "/app/server/src/index.ts" ]; then
    echo "Error: /app/server/src/index.ts not found"
    exit 1
fi

echo "Step 5: Starting server in dev mode"
cd /app/server
NODE_ENV=development DEBUG=* pnpm exec ts-node-dev --project tsconfig.build.json src/index.ts

# End of script


