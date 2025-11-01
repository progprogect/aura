/**
 * Скрипт для инициализации статистики отзывов для существующих специалистов
 * Запускать после миграции add_review_stats_to_specialist
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeReviewStats() {
  console.log('🚀 Начинаем инициализацию статистики отзывов...')

  try {
    // Получаем всех специалистов
    const specialists = await prisma.specialistProfile.findMany({
      select: { id: true }
    })

    console.log(`📊 Найдено специалистов: ${specialists.length}`)

    let updated = 0
    let errors = 0

    // Обновляем статистику для каждого специалиста
    for (const specialist of specialists) {
      try {
        // Получаем все отзывы специалиста
        const reviews = await prisma.review.findMany({
          where: { specialistId: specialist.id },
          select: { rating: true }
        })

        const totalReviews = reviews.length

        // Вычисляем средний рейтинг
        let averageRating = 0
        if (totalReviews > 0) {
          const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
          averageRating = Math.round((sum / totalReviews) * 10) / 10
        }

        // Обновляем в БД
        await prisma.specialistProfile.update({
          where: { id: specialist.id },
          data: {
            averageRating,
            totalReviews
          }
        })

        if (totalReviews > 0) {
          console.log(`✅ Specialist ${specialist.id}: ${averageRating}★ (${totalReviews} отзывов)`)
          updated++
        }
      } catch (error) {
        console.error(`❌ Ошибка для specialist ${specialist.id}:`, error)
        errors++
      }
    }

    console.log('✨ Готово!')
    console.log(`   Обновлено: ${updated}`)
    console.log(`   Ошибок: ${errors}`)
    console.log(`   Пропущено (без отзывов): ${specialists.length - updated - errors}`)

  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем скрипт
initializeReviewStats()
  .then(() => {
    console.log('🎉 Скрипт завершён успешно')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Скрипт завершился с ошибкой:', error)
    process.exit(1)
  })

