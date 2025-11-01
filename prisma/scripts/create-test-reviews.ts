/**
 * Скрипт для создания тестовых отзывов
 * Создает отзывы для существующих специалистов
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateSpecialistReviewStats(specialistId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { specialistId },
    select: { rating: true }
  })

  const totalReviews = reviews.length
  let averageRating = 0
  if (totalReviews > 0) {
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    averageRating = Math.round((sum / totalReviews) * 10) / 10
  }

  await prisma.specialistProfile.update({
    where: { id: specialistId },
    data: { averageRating, totalReviews }
  })
}

async function createTestReviews() {
  console.log('🚀 Создание тестовых отзывов...')

  try {
    // Получаем специалистов
    const specialists = await prisma.specialistProfile.findMany({
      take: 10,
      include: {
        user: true,
        services: {
          where: { isActive: true },
          take: 1
        }
      }
    })

    if (specialists.length === 0) {
      console.log('❌ Нет специалистов в базе')
      return
    }

    console.log(`📊 Найдено специалистов: ${specialists.length}`)

    // Создаем или находим тестового клиента
    let clientUser = await prisma.user.findFirst({
      where: {
        NOT: {
          id: { in: specialists.map(s => s.userId) }
        }
      }
    })

    if (!clientUser) {
      clientUser = await prisma.user.create({
        data: {
          firstName: 'Тестовый',
          lastName: 'Клиент',
          phone: '+79990000000'
        }
      })
      console.log('✅ Создан тестовый клиент')
    }

    let created = 0

    // Создаем отзывы для каждого специалиста
    for (const specialist of specialists) {
      // Проверяем, есть ли уже завершенные заказы
      let order = await prisma.order.findFirst({
        where: {
          specialistProfileId: specialist.id,
          status: 'completed',
          review: null
        }
      })

      // Если нет заказов, создаем завершенный заказ для теста
      if (!order && specialist.services.length > 0) {
        order = await prisma.order.create({
          data: {
            serviceId: specialist.services[0].id,
            specialistProfileId: specialist.id,
            clientUserId: clientUser.id,
            clientName: `${clientUser.firstName} ${clientUser.lastName}`,
            clientContact: clientUser.phone,
            clientMessage: 'Тестовый заказ для отзывов',
            pointsUsed: specialist.services[0].price,
            status: 'completed',
            completedAt: new Date()
          }
        })
        console.log(`✅ Создан завершенный заказ для ${specialist.user.firstName}`)
      }

      if (!order) {
        console.log(`⚠️  Нет возможности создать заказ для ${specialist.user.firstName}`)
        continue
      }

      // Создаем отзыв
      const rating = Math.floor(Math.random() * 3) + 3 // 3, 4 или 5
      const comments = [
        'Отличный специалист, помог решить мои вопросы!',
        'Очень доволен работой. Все чётко и по делу.',
        'Качественная консультация, всем рекомендую!',
        'Профессионал своего дела. Планирую обратиться снова.',
        null
      ]
      const comment = comments[Math.floor(Math.random() * comments.length)]

      await prisma.review.create({
        data: {
          orderId: order.id,
          specialistId: specialist.id,
          userId: clientUser.id,
          rating,
          comment
        }
      })

      created++
      console.log(`✅ Создан отзыв: ${rating}★ для ${specialist.user.firstName}`)

      // Обновляем статистику
      await updateSpecialistReviewStats(specialist.id)
    }

    console.log('✨ Готово!')
    console.log(`   Создано отзывов: ${created}`)

  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем скрипт
createTestReviews()
  .then(() => {
    console.log('🎉 Скрипт завершён успешно')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Скрипт завершился с ошибкой:', error)
    process.exit(1)
  })
