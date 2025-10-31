/**
 * API для подтверждения выполнения заказа пользователем
 * PATCH /api/orders/[id]/confirm
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/server'
import { PointsService } from '@/lib/points/points-service'
import { Decimal } from 'decimal.js'
import { notifySpecialistAboutConfirmedCompletion } from '@/lib/notifications/sms-notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const orderId = params.id

    // Получаем заказ
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: {
          select: {
            title: true
          }
        },
        specialistProfile: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        request: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }

    // Проверяем, что пользователь - владелец заказа
    if (order.clientUserId !== user.id) {
      return NextResponse.json({ error: 'Нет прав для подтверждения этого заказа' }, { status: 403 })
    }

    // Проверяем статус заказа
    if (order.status !== 'pending_completion') {
      return NextResponse.json({ error: 'Заказ не ожидает подтверждения' }, { status: 400 })
    }

    // Проверяем, нет ли открытого спора
    if (order.status === 'disputed' || order.disputeReason) {
      return NextResponse.json(
        { error: 'Нельзя подтвердить заказ со спором. Дождитесь решения администратора.' },
        { status: 400 }
      )
    }

    // Подтверждаем заказ в транзакции
    await prisma.$transaction(async (tx) => {
      // Переводим баллы специалисту (только если нет спора)
      if (order.pointsUsed > 0 && order.status !== 'disputed') {
        await PointsService.addPoints(
          order.specialistProfile.userId,
          new Decimal(order.pointsUsed),
          'service_completion',
          'balance',
          `Выполнение услуги: ${order.service.title}`,
          {
            orderId: order.id,
            serviceTitle: order.service.title,
            clientName: order.clientName
          }
        )
      }

      // Обновляем заказ
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'completed',
          pointsFrozen: false,
          escrowReleased: true,
          completedAt: new Date()
        }
      })

      // Если заказ связан с заявкой, обновляем её статус
      if (order.requestId) {
        await tx.userRequest.update({
          where: { id: order.requestId },
          data: {
            status: 'completed'
          }
        })
      }
    })

    // Отправляем SMS уведомление специалисту (асинхронно)
    notifySpecialistAboutConfirmedCompletion(
      order.specialistProfile.userId,
      user.firstName,
      order.service.title,
      order.pointsUsed
    ).catch(err => {
      console.error('[API/orders/confirm] Ошибка отправки уведомления:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Заказ подтверждён! Баллы переведены специалисту.',
      requiresReview: true // Флаг для показа формы отзыва
    })

  } catch (error) {
    console.error('[API/orders/[id]/confirm] Ошибка:', error)
    return NextResponse.json(
      { error: 'Ошибка при подтверждении заказа' },
      { status: 500 }
    )
  }
}

