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

    if (!session.specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Профиль специалиста не найден' },
        { status: 404 }
      )
    }

    // Парсим тело запроса
    const body = await request.json()
    const { field, value } = UpdateArraySchema.parse(body)

    // Обновляем профиль специалиста
    const specialistProfile = await prisma.specialistProfile.update({
      where: { id: session.specialistProfile!.id },
      data: {
        [field]: value,
      }
    })

    return NextResponse.json({
      success: true,
      field,
      value: specialistProfile[field as keyof typeof specialistProfile],
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

