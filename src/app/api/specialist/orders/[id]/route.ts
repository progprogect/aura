/**
 * API для управления конкретным заказом
 * PATCH /api/specialist/orders/[id] - обновление статуса
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UpdateOrderStatusSchema } from '@/lib/validations/api'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { canTransitionStatus } from '@/lib/services/utils'
import type { OrderStatus } from '@/types/service'

export async function PATCH(
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
        { success: false, error: 'Профиль специалиста не найден' },
        { status: 404 }
      )
    }

    const orderId = params.id
    const body = await request.json()
    const data = UpdateOrderStatusSchema.parse(body)

    // Проверяем, что заказ принадлежит текущему специалисту
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: {
          select: {
            deliveryDays: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    if (order.specialistProfileId !== session.specialistProfile.id) {
      return NextResponse.json(
        { success: false, error: 'Нет доступа' },
        { status: 403 }
      )
    }

    // Проверяем валидность перехода статуса
    if (!canTransitionStatus(order.status as OrderStatus, data.status as OrderStatus)) {
      return NextResponse.json(
        { success: false, error: `Невозможно изменить статус с "${order.status}" на "${data.status}"` },
        { status: 400 }
      )
    }

    // Валидация для disputed статуса
    if (data.status === 'disputed' && !data.disputeReason) {
      return NextResponse.json(
        { success: false, error: 'Укажите причину спора' },
        { status: 400 }
      )
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      status: data.status,
      updatedAt: new Date()
    }

    // Устанавливаем deadline при переходе в in_progress
    if (data.status === 'in_progress' && !order.deadline && order.service.deliveryDays) {
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + order.service.deliveryDays)
      updateData.deadline = deadline
    }

    // Устанавливаем completedAt при завершении
    if (data.status === 'completed') {
      updateData.completedAt = new Date()
      // TODO: После интеграции системы баллов:
      // 1. Проверить что средства на эскроу (transactionId существует)
      // 2. Создать Transaction на перевод специалисту
      // 3. Установить escrowReleased = true
    }

    // Обрабатываем спор
    if (data.status === 'disputed') {
      updateData.disputeReason = data.disputeReason
      updateData.disputedAt = new Date()
      // TODO: Отправить уведомление админу/support
    }

    // Обновляем заказ
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        service: {
          select: {
            title: true,
            emoji: true,
          }
        }
      }
    })

    return NextResponse.json({ success: true, order: updated })

  } catch (error) {
    console.error('[API/specialist/orders/update] Ошибка:', error)
    
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: (error as any).issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

