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

async function addMoreReviews() {
  console.log('🚀 Создание дополнительных отзывов...')

  try {
    // Получаем всех специалистов с услугами
    const specialists = await prisma.specialistProfile.findMany({
      include: {
        user: true,
        services: {
          where: { isActive: true },
          take: 1
        }
      }
    })

    // Получаем клиентов
    const clients = await prisma.user.findMany({
      where: {
        NOT: {
          specialistProfile: { isNot: null }
        }
      },
      take: 10
    })

    if (clients.length === 0) {
      console.log('❌ Нет клиентов в базе')
      return
    }

    let created = 0

    for (const specialist of specialists) {
      if (specialist.services.length === 0) continue

      // Создаем заказ для каждого клиента
      for (const client of clients) {
        const existingOrder = await prisma.order.findFirst({
          where: {
            specialistProfileId: specialist.id,
            clientUserId: client.id,
            status: 'completed'
          }
        })

        if (existingOrder) continue

        const order = await prisma.order.create({
          data: {
            serviceId: specialist.services[0].id,
            specialistProfileId: specialist.id,
            clientUserId: client.id,
            clientName: `${client.firstName} ${client.lastName}`,
            clientContact: client.phone,
            clientMessage: 'Тестовый заказ',
            pointsUsed: specialist.services[0].price,
            status: 'completed',
            completedAt: new Date()
          }
        })

        const rating = Math.floor(Math.random() * 3) + 3 // 3, 4 или 5
        const comments = [
          'Отличный специалист, помог решить мои вопросы!',
          'Очень доволен работой. Все чётко и по делу.',
          'Качественная консультация, всем рекомендую!',
          'Профессионал своего дела. Планирую обратиться снова.',
          'Быстро и эффективно. Спасибо!',
          'Прекрасный подход, результативно!',
          'Помог разобраться в сложной ситуации.',
          'Очень внимательный и профессиональный.'
        ]
        const comment = comments[Math.floor(Math.random() * comments.length)]

        await prisma.review.create({
          data: {
            orderId: order.id,
            specialistId: specialist.id,
            userId: client.id,
            rating,
            comment,
          }
        })

        created++
        if (created >= 20) break // Ограничиваем 20 отзывами
      }

      if (created >= 20) break

      // Обновляем статистику
      await updateSpecialistReviewStats(specialist.id)
    }

    console.log('✨ Готово!')
    console.log(`🎉 Создано отзывов: ${created}`)
  } catch (error) {
    console.error('💥 Скрипт завершился с ошибкой:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMoreReviews()
