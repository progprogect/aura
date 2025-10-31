/**
 * Утилита для создания временной Service из заявки
 */

import { prisma } from '@/lib/db'
import { generateServiceSlug } from './utils'

export async function createTemporaryServiceForRequest(
  specialistProfileId: string,
  requestTitle: string,
  price: number
) {
  // Получаем существующие slugs специалиста
  const existingServices = await prisma.service.findMany({
    where: { specialistProfileId },
    select: { slug: true }
  })

  const existingSlugs = existingServices.map(s => s.slug).filter(Boolean) as string[]

  // Генерируем уникальный slug
  const slug = generateServiceSlug(`Заявка: ${requestTitle}`, existingSlugs)

  // Создаём временную Service
  const service = await prisma.service.create({
    data: {
      specialistProfileId,
      title: `Заявка: ${requestTitle}`,
      description: `Услуга создана автоматически для заявки пользователя`,
      slug,
      price,
      highlights: ['Выполнение по заявке пользователя'],
      emoji: '💼',
      isActive: true,
      order: 0
    }
  })

  return service
}

