#!/bin/sh

echo "Starting server startup script..."
set -ex

# Print diagnostic information
echo "Current user: $(whoami)"
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PNPM version: $(pnpm --version)"
echo "Directory contents:"
ls -la

echo "Step 1: Setting up shared package"
cd /app/shared
echo "Current directory for shared setup:"
pwd
ls -la
echo "Installing shared dependencies..."
NODE_ENV=development pnpm install --no-frozen-lockfile
echo "Building shared package..."
pnpm run build
echo "Checking shared build:"
ls -la dist/

echo "Step 2: Setting up server"
cd /app/server
echo "Current directory for server setup:"
pwd
ls -la
echo "Installing server dependencies..."
NODE_ENV=development pnpm install --shamefully-hoist --no-frozen-lockfile
echo "Step 3: Checking TypeScript compilation"
pnpm run type-check

echo "Step 4: Starting server in dev mode"
cd /app/server
pnpm install --no-frozen-lockfile

echo "Step 5: Checking server directory"
pwd
ls -la

echo "Step 6: Checking TypeScript compilation"
pnpm run type-check

echo "Step 7: Starting server in dev mode"
DEBUG=express:*,socket.io:* NODE_DEBUG=http,net,stream pnpm run dev