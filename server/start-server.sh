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
NODE_ENV=development pnpm install --no-frozen-lockfile

echo "Building shared package..."
pnpm run build

echo "Step 2: Setting up server dependencies"
cd /app/server
echo "Current directory: $(pwd)"
NODE_ENV=development pnpm install --no-frozen-lockfile
echo "Checking shared build:"
ls -la dist/ || echo "No dist directory found"

cd /app/server
echo "Step 2: Setting up server"
echo "Current directory: $(pwd)"
ls -la

# Installing dependencies
NODE_ENV=development pnpm install --force
echo "Step 3: Checking TypeScript compilation"
pnpm run type-check

echo "Step 4: Starting server in dev mode"
cd /app/server # Убедимся, что мы в правильной директории
NODE_ENV=development DEBUG=* npx ts-node-dev --project /app/server/tsconfig.json --respawn --transpile-only --debug --trace-warnings /app/server/src/index.ts

# End of script


