#!/bin/sh
set -e

# Пересобираем shared пакет на случай изменений
echo "Rebuilding shared package..."
cd /app && pnpm --filter @ctor-game/shared build

# Запуск команды
exec "$@"