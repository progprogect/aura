/**
 * Скрипт для создания системного пользователя платформы
 * Использование: tsx prisma/scripts/create-platform-user.ts
 */

import { PrismaClient } from '@prisma/client'

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

const PLATFORM_USER_ID = 'platform-system-user'
const PLATFORM_EMAIL = 'platform@evolyutsiya360.com'
const PLATFORM_PHONE = '+375000000000'

async function createPlatformUser() {
  try {
    // Проверяем, существует ли уже системный пользователь
    const existingUser = await prisma.user.findUnique({
      where: { id: PLATFORM_USER_ID },
    })

    if (existingUser) {
      console.log('✅ Системный пользователь платформы уже существует!')
      console.log(`ID: ${PLATFORM_USER_ID}`)
      return
    }

    // Проверяем, не занят ли email или телефон
    const existingEmail = await prisma.user.findUnique({
      where: { email: PLATFORM_EMAIL },
    })

    if (existingEmail) {
      console.error(`❌ Email ${PLATFORM_EMAIL} уже занят другим пользователем!`)
      process.exit(1)
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: PLATFORM_PHONE },
    })

    if (existingPhone) {
      console.error(`❌ Телефон ${PLATFORM_PHONE} уже занят другим пользователем!`)
      process.exit(1)
    }

    // Создаем системного пользователя
    const platformUser = await prisma.user.create({
      data: {
        id: PLATFORM_USER_ID,
        firstName: 'Platform',
        lastName: 'System',
        email: PLATFORM_EMAIL,
        phone: PLATFORM_PHONE,
        balance: 0,
        bonusBalance: 0,
        blocked: false,
      },
    })

    console.log('✅ Системный пользователь платформы успешно создан!')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 Данные пользователя:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`ID: ${platformUser.id}`)
    console.log(`Email: ${platformUser.email}`)
    console.log(`Phone: ${platformUser.phone}`)
    console.log(`Balance: ${platformUser.balance}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
  } catch (error) {
    console.error('❌ Ошибка создания системного пользователя:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем скрипт
createPlatformUser()

