#!/bin/sh

echo "Starting server startup script..."
set -ex

echo "Step 1: Installing root dependencies"
cd /app
pnpm install --no-workspace-root

echo "Step 2: Installing shared dependencies"
cd /app/shared
pnpm install
echo "Step 3: Building shared package"
pnpm build

echo "Step 4: Installing server dependencies"
cd /app/server
pnpm install

echo "Step 5: Checking server directory"
pwd
ls -la

echo "Step 6: Checking TypeScript compilation"
pnpm run type-check

echo "Step 7: Starting server in dev mode"
DEBUG=express:*,socket.io:* NODE_DEBUG=http,net,stream pnpm run dev