/**
 * Сервис для работы со статистикой отзывов
 */

import { prisma } from '@/lib/db'
import type { ReviewDistribution } from '@/types/review'

/**
 * Получить распределение рейтингов для специалиста
 */
export async function getReviewDistribution(
  specialistId: string
): Promise<ReviewDistribution> {
  const reviews = await prisma.review.findMany({
    where: { specialistId },
    select: { rating: true },
  })

  const distribution: ReviewDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as keyof ReviewDistribution]++
    }
  })

  return distribution
}

/**
 * Пересчитать и обновить статистику отзывов для специалиста
 */
export async function updateSpecialistReviewStats(specialistId: string): Promise<void> {
  // Получаем все отзывы специалиста
  const reviews = await prisma.review.findMany({
    where: { specialistId },
    select: { rating: true },
  })

  const totalReviews = reviews.length

  // Вычисляем средний рейтинг
  let averageRating = 0
  if (totalReviews > 0) {
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    averageRating = Math.round((sum / totalReviews) * 10) / 10 // Округляем до 1 знака после запятой
  }

  // Обновляем в БД
  await prisma.specialistProfile.update({
    where: { id: specialistId },
    data: {
      averageRating,
      totalReviews,
    },
  })
}

/**
 * Пересчитать статистику для всех специалистов
 */
export async function updateAllSpecialistsReviewStats(): Promise<void> {
  const specialists = await prisma.specialistProfile.findMany({
    select: { id: true },
  })

  // Обновляем статистику для каждого специалиста
  for (const specialist of specialists) {
    await updateSpecialistReviewStats(specialist.id)
  }
}

