#!/bin/sh
set -e

# Пересобираем shared пакет на случай изменений
echo "Rebuilding shared package..."
cd /app/shared && pnpm build

# Запуск команды
exec "$@"