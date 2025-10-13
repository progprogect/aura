/**
 * API для создания спора по заказу
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/server'
import { PointsService } from '@/lib/points/points-service'
import { Decimal } from 'decimal.js'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Получаем текущего пользователя
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
            userId: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }

    // Проверяем, что пользователь - клиент заказа
    if (order.clientContact !== user.phone) {
      return NextResponse.json({ error: 'Нет прав для создания спора' }, { status: 403 })
    }

    // Проверяем статус заказа (можно оспаривать только оплаченные заказы)
    if (!['paid', 'completed'].includes(order.status)) {
      return NextResponse.json({ error: 'Заказ нельзя оспорить' }, { status: 400 })
    }

    // Проверяем, что спор еще не создан
    if (order.status === 'disputed') {
      return NextResponse.json({ error: 'Спор уже создан' }, { status: 400 })
    }

    // Парсим данные запроса
    const body = await request.json()
    const { reason } = body

    if (!reason?.trim()) {
      return NextResponse.json({ error: 'Укажите причину спора' }, { status: 400 })
    }

    // Создаем спор в транзакции
    await prisma.$transaction(async (tx) => {
      // Если заказ еще не завершен, возвращаем баллы клиенту
      if (order.status === 'paid' && order.pointsUsed > 0) {
        await PointsService.addPoints(
          user.id,
          new Decimal(order.pointsUsed),
          'dispute_refund',
          'balance', // Возвращаем в основной баланс
          `Возврат за спор по заказу: ${order.service.title}`,
          {
            orderId: order.id,
            serviceTitle: order.service.title,
            disputeReason: reason.trim()
          }
        )
      }

      // Обновляем статус заказа
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'disputed',
          disputeReason: reason.trim(),
          disputedAt: new Date(),
          pointsFrozen: false // Размораживаем баллы при споре
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Спор создан. Администратор рассмотрит в течение 24 часов.'
    })

  } catch (error) {
    console.error('Ошибка создания спора:', error)
    return NextResponse.json(
      { error: 'Ошибка создания спора' }, 
      { status: 500 }
    )
  }
}
