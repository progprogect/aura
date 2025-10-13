/**
 * Cron job для автоматического подтверждения заказов
 * Запускается раз в день для обработки заказов с истекшим сроком автоподтверждения
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PointsService } from '@/lib/points/points-service'
import { Decimal } from 'decimal.js'

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию (только для cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Запуск автоподтверждения заказов...')

    // Находим заказы для автоподтверждения
    const ordersToConfirm = await prisma.order.findMany({
      where: {
        status: 'paid',
        pointsFrozen: true,
        autoConfirmAt: {
          lte: new Date() // Время автоподтверждения истекло
        }
      },
      include: {
        service: {
          select: {
            title: true
          }
        },
        specialistProfile: {
          select: {
            userId: true,
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

    console.log(`📋 Найдено заказов для автоподтверждения: ${ordersToConfirm.length}`)

    let processedCount = 0
    let errorCount = 0

    for (const order of ordersToConfirm) {
      try {
        await prisma.$transaction(async (tx) => {
          // Переводим баллы специалисту
          if (order.pointsUsed > 0) {
            await PointsService.addPoints(
              order.specialistProfile.userId,
              new Decimal(order.pointsUsed),
              'auto_completion',
              'balance',
              `Автоподтверждение услуги: ${order.service.title}`,
              {
                orderId: order.id,
                serviceTitle: order.service.title,
                clientName: order.clientName,
                autoConfirmed: true
              }
            )
          }

          // Обновляем статус заказа
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'completed',
              pointsFrozen: false,
              completedAt: new Date(),
              resultDescription: 'Заказ автоматически подтвержден через 7 дней'
            }
          })
        })

        processedCount++
        console.log(`✅ Заказ ${order.id} автоподтвержден`)

      } catch (error) {
        errorCount++
        console.error(`❌ Ошибка автоподтверждения заказа ${order.id}:`, error)
      }
    }

    const result = {
      success: true,
      processed: processedCount,
      errors: errorCount,
      total: ordersToConfirm.length,
      timestamp: new Date().toISOString()
    }

    console.log('🎉 Автоподтверждение завершено:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Критическая ошибка в cron job:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
