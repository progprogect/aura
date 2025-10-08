/**
 * API для обновления кастомных полей специализации
 * PATCH /api/specialist/profile/custom-fields
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

const UpdateCustomFieldSchema = z.object({
  key: z.string().min(1, 'Ключ поля обязателен'),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.null()
  ]),
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
    const { key, value } = UpdateCustomFieldSchema.parse(body)

    // Получаем текущие customFields
    const currentCustomFields = (session.specialist.customFields as Record<string, any>) || {}

    // Обновляем конкретное поле
    const updatedCustomFields = {
      ...currentCustomFields,
      [key]: value
    }

    // Если значение null, удаляем поле
    if (value === null) {
      delete updatedCustomFields[key]
    }

    // Сохраняем в БД
    const specialist = await prisma.specialist.update({
      where: { id: session.specialistId },
      data: {
        customFields: updatedCustomFields,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      key,
      value,
      customFields: specialist.customFields,
      message: 'Поле обновлено'
    })

  } catch (error) {
    console.error('Ошибка при обновлении кастомных полей:', error)

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

