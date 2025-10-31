/**
 * API для управления откликами
 * PATCH - принять отклик (только для владельца заявки)
 * DELETE - отозвать отклик (только для специалиста)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { PointsService } from '@/lib/points/points-service'
import { Decimal } from 'decimal.js'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    if (!session.specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Только специалисты могут отзывать отклики' },
        { status: 403 }
      )
    }

    // Гарантируем, что specialistProfile существует
    const specialistProfileId = session.specialistProfile.id

    const proposalId = params.id

    // Получаем отклик
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        request: true
      }
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Отклик не найден' },
        { status: 404 }
      )
    }

    // Проверяем, что отклик принадлежит текущему специалисту
    if (proposal.specialistId !== specialistProfileId) {
      return NextResponse.json(
        { success: false, error: 'Нет прав для отзыва этого отклика' },
        { status: 403 }
      )
    }

    // Проверяем статус (можно отозвать только pending)
    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Нельзя отозвать отклик с таким статусом' },
        { status: 400 }
      )
    }

    // Обновляем статус
    await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status: 'withdrawn',
        withdrawnAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Отклик отозван'
    })

  } catch (error) {
    console.error('[API/proposals/[id]/DELETE] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при отзыве отклика' },
      { status: 500 }
    )
  }
}

