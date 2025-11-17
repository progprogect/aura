/**
 * API для подтверждения выполнения заказа специалистом
 * PATCH /api/orders/[id]/self-confirm
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/server'
import { CommissionService } from '@/lib/commission/commission-service'
import { Decimal } from 'decimal.js'
import { notifyUserAboutCompletedWork } from '@/lib/notifications/sms-notifications'

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

    // Проверяем, что пользователь - специалист, владелец услуги
    if (order.specialistProfile.userId !== user.id) {
      return NextResponse.json({ error: 'Нет прав для подтверждения этого заказа' }, { status: 403 })
    }

    // Проверяем статус заказа
    if (order.status !== 'pending_completion') {
      return NextResponse.json({ error: 'Заказ не ожидает подтверждения' }, { status: 400 })
    }

    // Проверяем, нет ли открытого спора
    if (order.disputeReason) {
      return NextResponse.json(
        { error: 'Нельзя подтвердить заказ со спором. Дождитесь решения администратора.' },
        { status: 400 }
      )
    }

    // Получаем ID системного пользователя до транзакции
    let platformUserId: string | null = null
    try {
      platformUserId = await CommissionService.getPlatformUserId()
    } catch (error) {
      console.warn('[API/orders/self-confirm] Системный пользователь не найден, комиссия не будет начислена')
    }

    // Подтверждаем заказ в транзакции
    await prisma.$transaction(async (tx) => {
      // Обрабатываем комиссию и выплату специалисту (только если нет спора)
      if (order.pointsUsed > 0 && !order.disputeReason && order.clientUserId) {
        if (platformUserId) {
          try {
            await CommissionService.processServiceCompletion(
              tx,
              order.id,
              order.clientUserId,
              order.specialistProfile.userId,
              new Decimal(order.pointsUsed),
              platformUserId
            )
          } catch (commissionError) {
            console.error('[API/orders/self-confirm] Ошибка обработки комиссии:', commissionError)
            throw commissionError
          }
        } else {
          // Fallback: начисляем специалисту полную сумму (для обратной совместимости)
          const { PointsService } = await import('@/lib/points/points-service')
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

    // Отправляем SMS уведомление клиенту (асинхронно)
    if (order.clientUserId) {
      notifyUserAboutCompletedWork(
        order.clientUserId,
        `${order.specialistProfile.user.firstName} ${order.specialistProfile.user.lastName}`,
        order.service.title
      ).catch(err => {
        console.error('[API/orders/self-confirm] Ошибка отправки уведомления:', err)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Заказ подтверждён! Баллы переведены на ваш баланс.',
    })

  } catch (error) {
    console.error('[API/orders/[id]/self-confirm] Ошибка:', error)
    return NextResponse.json(
      { error: 'Ошибка при подтверждении заказа' },
      { status: 500 }
    )
  }
}

