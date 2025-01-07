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

echo "Step 1: Installing root dependencies"
cd /app
pnpm install --no-frozen-lockfile

echo "Step 2: Installing shared dependencies"
cd /app/shared
pnpm install --no-frozen-lockfile
echo "Step 3: Building shared package"
pnpm build

echo "Step 4: Installing server dependencies"
cd /app/server
pnpm install --no-frozen-lockfile

echo "Step 5: Checking server directory"
pwd
ls -la

echo "Step 6: Checking TypeScript compilation"
pnpm run type-check

echo "Step 7: Starting server in dev mode"
DEBUG=express:*,socket.io:* NODE_DEBUG=http,net,stream pnpm run dev