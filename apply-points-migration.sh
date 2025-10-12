#!/bin/bash

# Скрипт применения миграции системы баллов к Railway БД
# Использование: ./apply-points-migration.sh

echo "🚀 Применение миграции системы баллов..."

# Применить SQL миграцию
psql "$DATABASE_PUBLIC_URL" < prisma/migrations/20251012_add_points_system/migration.sql

if [ $? -eq 0 ]; then
    echo "✅ Миграция успешно применена!"
    echo "🔄 Генерация Prisma Client..."
    npx prisma generate
    echo "✅ Готово!"
else
    echo "❌ Ошибка при применении миграции"
    exit 1
fi

