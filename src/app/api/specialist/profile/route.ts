/**
 * API для обновления профиля специалиста (inline editing)
 * PATCH /api/specialist/profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAuthSession, UNAUTHORIZED_RESPONSE, SESSION_EXPIRED_RESPONSE } from '@/lib/auth/api-auth'

// Схема для обновления профиля
const UpdateProfileSchema = z.object({
  field: z.enum([
    'firstName',
    'lastName',
    'tagline',
    'about',
    'city',
    'country',
    'email',
    'telegram',
    'whatsapp',
    'instagram',
    'website',
    'priceFrom',
    'priceTo',
    'priceDescription',
    'yearsOfPractice',
    'videoUrl',
    'acceptingClients'
  ]),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
})

export async function PATCH(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    // Парсим тело запроса
    const body = await request.json()
    const { field, value } = UpdateProfileSchema.parse(body)

    // Специальная обработка для числовых полей
    let processedValue = value
    if (field === 'priceFrom' || field === 'priceTo' || field === 'yearsOfPractice') {
      if (typeof value === 'string') {
        processedValue = value ? parseInt(value, 10) : null
      }
    }

    // Обновляем профиль
    const specialist = await prisma.specialist.update({
      where: { id: session.specialistId },
      data: {
        [field]: processedValue,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      field,
      value: specialist[field as keyof typeof specialist],
      message: 'Профиль обновлён'
    })

  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ошибка валидации данных',
          details: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

