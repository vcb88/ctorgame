#!/bin/sh
set -e

# Диагностика и сборка
echo "Environment setup..."
cd /app
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "TypeScript version: $(tsc --version)"
echo "ts-node-dev version: $(ts-node-dev --version || echo 'not found')"

echo "\nProject structure:"
ls -la
echo "\nWorkspace packages:"
pnpm ls -r

echo "\nRebuilding shared package..."
echo "Checking shared package files:"
ls -la shared/src/
echo "Running shared build..."
pnpm --filter @ctor-game/shared build

echo "\nChecking server package:"
ls -la server/src/
echo "Node modules in server:"
ls -la server/node_modules/

# Запуск команды
exec "$@"