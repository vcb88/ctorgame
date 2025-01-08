#!/bin/sh
set -e

# Пересобираем shared пакет на случай изменений
echo "Rebuilding shared package..."
cd /app && pnpm --filter shared build

# Запуск команды
exec "$@"