/**
 * API для отмены заявки
 * PATCH /api/requests/[id]/cancel
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { notifySpecialistsAboutCancelledRequest } from '@/lib/notifications/sms-notifications'

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

    // Получаем заявку
    const userRequest = await prisma.userRequest.findUnique({
      where: { id: requestId },
      include: {
        proposals: {
          select: {
            id: true,
            status: true,
            specialist: {
              select: {
                user: {
                  select: {
                    phone: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!userRequest) {
      return NextResponse.json(
        { success: false, error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь - владелец заявки
    if (userRequest.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Нет прав для отмены этой заявки' },
        { status: 403 }
      )
    }

    // Проверяем статус заявки
    if (userRequest.status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'Можно отменить только открытую заявку' },
        { status: 400 }
      )
    }

    // Отменяем заявку в транзакции
    await prisma.$transaction(async (tx) => {
      // Обновляем статус заявки
      await tx.userRequest.update({
        where: { id: requestId },
        data: {
          status: 'cancelled',
          closedAt: new Date()
        }
      })

      // Обновляем статус всех откликов на 'expired'
      await tx.proposal.updateMany({
        where: {
          requestId,
          status: 'pending'
        },
        data: {
          status: 'expired',
          rejectedAt: new Date()
        }
      })
    })

    // Отправляем SMS уведомление специалистам с откликами (асинхронно)
    notifySpecialistsAboutCancelledRequest(requestId, userRequest.title).catch(err => {
      console.error('[API/requests/cancel] Ошибка отправки уведомлений:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Заявка отменена'
    })

  } catch (error) {
    console.error('[API/requests/[id]/cancel/PATCH] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при отмене заявки' },
      { status: 500 }
    )
  }
}

