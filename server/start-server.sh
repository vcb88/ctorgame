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

echo "Step 1: Setting up directories and permissions"
mkdir -p /app/.pnpm-store
chown -R node:node /app/.pnpm-store

# Ensure node_modules directories exist with correct permissions
for dir in /app/shared /app/server /app/client; do
    mkdir -p $dir/node_modules
    chown -R node:node $dir/node_modules
done

cd /app/shared
echo "Step 2: Setting up shared package"
echo "Current directory: $(pwd)"
ls -la

# Clean install without dependencies
rm -rf node_modules package-lock.json pnpm-lock.yaml
NODE_ENV=development pnpm install --prefer-offline

echo "Building shared package..."
pnpm run build
echo "Checking shared build:"
ls -la dist/ || echo "No dist directory found"

cd /app/server
echo "Step 3: Setting up server"
echo "Current directory: $(pwd)"
ls -la

# Clean install without dependencies
rm -rf node_modules package-lock.json pnpm-lock.yaml
NODE_ENV=development pnpm install --prefer-offline
echo "Step 3: Checking TypeScript compilation"
pnpm run type-check

echo "Step 4: Starting server in dev mode"

echo "Step 5: Checking server directory"
pwd
ls -la

echo "Step 6: Checking TypeScript compilation"
pnpm run type-check

echo "Step 7: Starting server in dev mode"
DEBUG=express:*,socket.io:* NODE_DEBUG=http,net,stream pnpm run dev