#!/bin/sh
set -e

# Полная пересборка проекта из корневого каталога
echo "Cleaning and rebuilding all packages..."
pnpm clean:rebuild

# Запуск команды
exec "$@"