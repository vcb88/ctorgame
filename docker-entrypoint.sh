#!/bin/sh
set -e

# Пересобираем shared пакет на случай изменений
echo "Rebuilding shared package..."
cd /app
echo "Current directory: $(pwd)"
echo "TypeScript version: $(tsc --version)"
echo "Checking shared package files:"
ls -la shared/src/
echo "Running build..."
pnpm --filter @ctor-game/shared build

# Запуск команды
exec "$@"