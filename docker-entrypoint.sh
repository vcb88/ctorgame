#!/bin/sh
set -e

# Проверяем и пересобираем shared пакет если нужно
cd /app
if [ -f "shared/src/index.ts" ]; then
    echo "Rebuilding shared package..."
    pnpm --filter @ctor-game/shared build
fi

# Запуск команды
exec "$@"