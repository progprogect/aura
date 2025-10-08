/**
 * API для обновления профиля специалиста (inline editing)
 * PATCH /api/specialist/profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getCurrentSpecialist } from '@/lib/auth/server'

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
    const sessionToken = request.cookies.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const session = await prisma.authSession.findFirst({
      where: {
        sessionToken,
        expiresAt: { gt: new Date() }
      }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Сессия истекла' },
        { status: 401 }
      )
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
          details: error.errors
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

