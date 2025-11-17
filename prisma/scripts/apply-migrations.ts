#!/usr/bin/env tsx
/**
 * Скрипт для применения миграций Prisma на production
 * Использование: npx tsx prisma/scripts/apply-migrations.ts
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const MIGRATIONS_DIR = join(process.cwd(), 'prisma', 'migrations')

async function applyMigrations() {
  console.log('🔄 Применение миграций Prisma...\n')

  // Проверяем наличие DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ Ошибка: DATABASE_URL не установлен')
    console.error('Установите переменную окружения DATABASE_URL')
    process.exit(1)
  }

  // Проверяем наличие директории миграций
  if (!existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ Ошибка: директория миграций не найдена: ${MIGRATIONS_DIR}`)
    process.exit(1)
  }

  try {
    // Применяем миграции через Prisma Migrate
    console.log('📦 Применение миграций через prisma migrate deploy...')
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
    })
    console.log('\n✅ Миграции успешно применены!')
  } catch (error) {
    console.error('\n❌ Ошибка при применении миграций:', error)
    console.error('\n💡 Попробуйте применить миграции вручную:')
    console.error('   npx prisma migrate deploy')
    process.exit(1)
  }
}

// Запускаем скрипт
applyMigrations().catch((error) => {
  console.error('❌ Критическая ошибка:', error)
  process.exit(1)
})

