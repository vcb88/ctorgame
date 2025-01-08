#!/bin/sh
set -e

# Установка зависимостей при первом запуске
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install --force
fi

# Сборка shared пакета
echo "Building shared package..."
cd shared
if [ ! -d "node_modules" ]; then
    pnpm install --force
fi
pnpm build
cd ..

# Запуск команды
exec "$@"