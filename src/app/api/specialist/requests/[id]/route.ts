/**
 * API для управления конкретной заявкой
 * PATCH /api/specialist/requests/[id] - обновление статуса
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

const UpdateRequestSchema = z.object({
  status: z.enum(['new', 'contacted', 'scheduled', 'declined']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    const requestId = params.id
    const body = await request.json()
    const data = UpdateRequestSchema.parse(body)

    // Проверяем, что заявка принадлежит текущему специалисту
    const consultationRequest = await prisma.consultationRequest.findUnique({
      where: { id: requestId },
      select: { specialistProfileId: true }
    })

    if (!consultationRequest) {
      return NextResponse.json(
        { success: false, error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    if (consultationRequest.specialistProfileId !== session.specialistProfile!.id) {
      return NextResponse.json(
        { success: false, error: 'Нет доступа' },
        { status: 403 }
      )
    }

    // Обновляем статус
    const updated = await prisma.consultationRequest.update({
      where: { id: requestId },
      data: {
        status: data.status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, request: updated })

  } catch (error) {
    console.error('[API/specialist/requests/update] Ошибка:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

