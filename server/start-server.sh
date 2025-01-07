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
echo "Current directory: $(pwd)"
ls -la

# Installing dependencies
NODE_ENV=development pnpm install --force

echo "Building shared package..."
pnpm run build
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

echo "Step 5: Checking server directory"
pwd
ls -la

echo "Step 6: Checking TypeScript compilation"
pnpm run type-check

echo "Step 7: Starting server in dev mode"
DEBUG=express:*,socket.io:* NODE_DEBUG=http,net,stream pnpm run dev