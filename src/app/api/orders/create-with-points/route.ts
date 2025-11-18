/**
 * API для создания заказа с оплатой баллами
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/server'
import { PointsService } from '@/lib/points/points-service'
import { CommissionService } from '@/lib/commission/commission-service'
import { CreateOrderSchema } from '@/lib/validations/api'
import { Decimal } from 'decimal.js'
import { notifySpecialistAboutNewOrder } from '@/lib/notifications/order-notifications'

export async function POST(request: NextRequest) {
  try {
    // Получаем текущего пользователя
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Парсим данные запроса
    const body = await request.json()
    const validatedData = CreateOrderSchema.parse(body)
    
    const { serviceId, clientName, clientContact, clientMessage, pointsUsed } = validatedData

    // Получаем информацию об услуге
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        specialistProfile: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Услуга не найдена' }, { status: 404 })
    }

    if (!service.isActive) {
      return NextResponse.json({ error: 'Услуга недоступна' }, { status: 400 })
    }

    // Проверяем, что пользователь не заказывает у себя
    if (service.specialistProfile.userId === user.id) {
      return NextResponse.json({ error: 'Нельзя заказывать услуги у себя' }, { status: 400 })
    }

    // Проверяем баланс баллов
    const balance = await PointsService.getBalance(user.id)
    if (balance.total.lt(pointsUsed)) {
      return NextResponse.json(
        { 
          error: 'Недостаточно баллов', 
          code: 'INSUFFICIENT_POINTS',
          required: pointsUsed,
          available: balance.total.toNumber()
        }, 
        { status: 400 }
      )
    }

    // Получаем ID системного пользователя до транзакции
    let platformUserId: string | null = null
    try {
      platformUserId = await CommissionService.getPlatformUserId()
    } catch (error) {
      console.warn('[API/orders/create-with-points] Системный пользователь не найден, кешбэк не будет начислен')
    }

    // Создаем заказ в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Списываем баллы (сначала бонусные, потом обычные)
      await PointsService.deductPoints(
        user.id,
        new Decimal(pointsUsed),
        'service_purchase',
        `Покупка услуги: ${service.title}`,
        {
          serviceId,
          serviceTitle: service.title,
          specialistId: service.specialistProfile.userId
        }
      )

      // Устанавливаем дату автоподтверждения (через 7 дней)
      const autoConfirmAt = new Date()
      autoConfirmAt.setDate(autoConfirmAt.getDate() + 7)

      // Создаем заказ
      const order = await tx.order.create({
        data: {
          serviceId,
          specialistProfileId: service.specialistProfileId,
          clientName,
          clientContact,
          clientMessage,
          clientUserId: user.id, // Связываем заказ с пользователем
          status: 'paid',
          pointsUsed,
          pointsPaid: new Decimal(pointsUsed), // Сумма оплаты в баллах
          pointsFrozen: true,
          escrowReleased: false, // Средства на эскроу до подтверждения выполнения
          autoConfirmAt,
          deadline: service.deliveryDays ? new Date(Date.now() + service.deliveryDays * 24 * 60 * 60 * 1000) : null
        },
        include: {
          service: {
            select: {
              title: true,
              emoji: true,
              slug: true
            }
          },
          specialistProfile: {
            select: {
              slug: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      })

      // Начисляем кешбэк сразу при покупке (только если системный пользователь существует)
      if (platformUserId) {
        try {
          await CommissionService.addCashbackForService(
            tx,
            order.id,
            user.id,
            new Decimal(pointsUsed),
            platformUserId
          )
        } catch (commissionError) {
          console.error('[API/orders/create-with-points] Ошибка обработки кешбэка:', commissionError)
          throw commissionError
        }
      }

      return order
    })

    // Отправляем SMS уведомление специалисту (асинхронно)
    notifySpecialistAboutNewOrder(
      service.specialistProfile.user.id,
      clientName,
      service.title,
      pointsUsed
    ).catch(err => {
      console.error('[API/orders/create-with-points] Ошибка отправки уведомления:', err)
    })

    return NextResponse.json({
      success: true,
      order: result,
      message: `Заказ создан! Баллы заморожены на 7 дней.`
    })

  } catch (error) {
    console.error('Ошибка создания заказа:', error)
    
    if (error instanceof Error && error.message.includes('Недостаточно баллов')) {
      return NextResponse.json(
        { error: 'Недостаточно баллов для покупки' }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Ошибка создания заказа' }, 
      { status: 500 }
    )
  }
}
