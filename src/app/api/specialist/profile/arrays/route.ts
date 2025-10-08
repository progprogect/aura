/**
 * API для обновления массивов в профиле (специализации, форматы работы)
 * PATCH /api/specialist/profile/arrays
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const UpdateArraySchema = z.object({
  field: z.enum(['specializations', 'workFormats']),
  value: z.array(z.string()),
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
    const { field, value } = UpdateArraySchema.parse(body)

    // Валидация
    if (field === 'specializations' && value.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Должна быть хотя бы одна специализация' },
        { status: 400 }
      )
    }

    if (field === 'workFormats' && value.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Должен быть хотя бы один формат работы' },
        { status: 400 }
      )
    }

    // Обновляем профиль
    const specialist = await prisma.specialist.update({
      where: { id: session.specialistId },
      data: {
        [field]: value,
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

