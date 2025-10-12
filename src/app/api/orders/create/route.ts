/**
 * API для создания заказа клиентом
 * POST /api/orders/create
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateOrderSchema } from '@/lib/validations/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateOrderSchema.parse(body)

    // Проверяем, что услуга существует и активна
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
      include: {
        specialistProfile: {
          select: {
            id: true,
            acceptingClients: true,
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Услуга не найдена' },
        { status: 404 }
      )
    }

    if (!service.isActive) {
      return NextResponse.json(
        { success: false, error: 'Услуга больше не доступна' },
        { status: 400 }
      )
    }

    if (!service.specialistProfile.acceptingClients) {
      return NextResponse.json(
        { success: false, error: 'Специалист временно не принимает новых клиентов' },
        { status: 400 }
      )
    }

    // Создаем заказ со статусом pending
    const order = await prisma.order.create({
      data: {
        serviceId: data.serviceId,
        specialistProfileId: service.specialistProfileId,
        clientName: data.clientName,
        clientContact: data.clientContact,
        clientMessage: data.clientMessage || null,
        status: 'pending',
        // TODO: После интеграции системы баллов:
        // 1. Проверить баланс пользователя
        // 2. Создать Transaction со статусом escrow
        // 3. Установить amountPaid, paymentMethod, transactionId
        // 4. Изменить статус на 'paid'
        // 5. Если есть deliveryDays - установить deadline
      },
      include: {
        service: {
          select: {
            title: true,
            price: true,
            emoji: true,
          }
        }
      }
    })

    // Обновляем счетчик заказов услуги
    await prisma.service.update({
      where: { id: data.serviceId },
      data: { orderCount: { increment: 1 } }
    })

    // TODO: Отправить уведомление специалисту (email/telegram)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        service: order.service,
      }
    })

  } catch (error) {
    console.error('[API/orders/create] Ошибка:', error)
    
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: (error as any).issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при создании заказа' },
      { status: 500 }
    )
  }
}

