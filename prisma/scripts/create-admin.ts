/**
 * Скрипт для создания администратора
 * Использование: npm run admin:create
 * или: tsx prisma/scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

// Используем DATABASE_URL из переменных окружения или fallback
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL

if (!databaseUrl) {
  console.error('❌ Ошибка: DATABASE_URL или DATABASE_PUBLIC_URL не установлен')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

async function createAdmin() {
  try {
    // Генерируем случайный пароль
    const password = randomBytes(16).toString('hex')
    const username = 'admin'

    // Хешируем пароль
    const passwordHash = await hashPassword(password)

    // Проверяем, существует ли уже админ с таким username
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    })

    if (existingAdmin) {
      console.log('❌ Администратор с таким логином уже существует!')
      console.log('Используйте другой username или удалите существующего админа.')
      process.exit(1)
    }

    // Создаем админа
    const admin = await prisma.admin.create({
      data: {
        username,
        passwordHash,
      },
    })

    console.log('✅ Администратор успешно создан!')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 Данные для входа:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Логин: ${username}`)
    console.log(`Пароль: ${password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('⚠️  ВАЖНО: Сохраните эти данные в безопасном месте!')
    console.log('⚠️  Пароль больше не будет показан.')
    console.log('')
    console.log(`🔗 URL для входа: /admin/login`)
    console.log('')
  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем скрипт
createAdmin()

