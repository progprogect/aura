#!/usr/bin/env tsx
/**
 * Скрипт для прямого применения миграций к базе данных
 * Использование: DATABASE_URL="..." npx tsx prisma/scripts/apply-migrations-direct.ts
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL

if (!DATABASE_URL) {
  console.error('❌ Ошибка: DATABASE_URL не установлен')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
})

async function applyMigration(migrationName: string, sql: string) {
  console.log(`\n📦 Применение миграции: ${migrationName}`)
  
  try {
    // Разбиваем SQL на отдельные команды
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.length > 0) {
        await prisma.$executeRawUnsafe(statement)
      }
    }
    
    console.log(`✅ Миграция ${migrationName} применена успешно`)
    return true
  } catch (error: any) {
    // Игнорируем ошибки "already exists" - это нормально для идемпотентных миграций
    if (error.message?.includes('already exists') || 
        error.message?.includes('duplicate') ||
        error.code === '42P07' || // duplicate_table
        error.code === '42710') { // duplicate_object
      console.log(`⚠️  Миграция ${migrationName} уже применена (игнорируем)`)
      return true
    }
    console.error(`❌ Ошибка при применении миграции ${migrationName}:`, error.message)
    throw error
  }
}

async function applyAllMigrations() {
  console.log('🔄 Применение миграций напрямую к базе данных...\n')
  console.log(`📡 Подключение к: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`)

  try {
    // Проверяем подключение
    await prisma.$connect()
    console.log('✅ Подключение к базе данных установлено\n')

    // Миграция 1: Portfolio
    const portfolioMigration = readFileSync(
      join(process.cwd(), 'prisma', 'migrations', '20251117115632_add_portfolio', 'migration.sql'),
      'utf-8'
    )
    await applyMigration('20251117115632_add_portfolio', portfolioMigration)

    // Миграция 2: Company Profile Fields
    const companyFieldsMigration = readFileSync(
      join(process.cwd(), 'prisma', 'migrations', '20251117184902_add_company_profile_fields', 'migration.sql'),
      'utf-8'
    )
    await applyMigration('20251117184902_add_company_profile_fields', companyFieldsMigration)

    console.log('\n✅ Все миграции применены успешно!')
    
    // Проверяем результат
    console.log('\n🔍 Проверка примененных изменений...')
    
    // Проверка PortfolioItem
    const portfolioExists = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PortfolioItem'
      ) as exists;
    `) as any[]
    
    if (portfolioExists[0]?.exists) {
      console.log('✅ Таблица PortfolioItem существует')
    } else {
      console.log('⚠️  Таблица PortfolioItem не найдена')
    }
    
    // Проверка полей компаний
    const companyFields = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_name = 'SpecialistProfile'
        AND column_name IN ('profileType', 'companyName', 'address', 'addressCoordinates', 'taxId')
      ORDER BY column_name;
    `) as any[]
    
    console.log(`✅ Найдено полей для компаний: ${companyFields.length}/5`)
    if (companyFields.length > 0) {
      console.log(`   Поля: ${companyFields.map(f => f.column_name).join(', ')}`)
    }

  } catch (error: any) {
    console.error('\n❌ Критическая ошибка:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Отключение от базы данных')
  }
}

// Запускаем скрипт
applyAllMigrations()
  .then(() => {
    console.log('\n🎉 Готово!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Ошибка:', error)
    process.exit(1)
  })

