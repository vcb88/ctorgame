#!/bin/sh
set -e

# Установка зависимостей при первом запуске
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

# Сборка shared пакета
cd shared && pnpm build
cd ..

# Запуск команды
exec "$@"