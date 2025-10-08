/**
 * API для обновления массивов в профиле (специализации, форматы работы)
 * PATCH /api/specialist/profile/arrays
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

const UpdateArraySchema = z.object({
  field: z.enum(['specializations', 'workFormats']),
  value: z.array(z.string()),
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
    const { field, value } = UpdateArraySchema.parse(body)

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

