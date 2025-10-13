/**
 * API для завершения заказа специалистом
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/server'
import { PointsService } from '@/lib/points/points-service'
import { FileUploadService } from '@/lib/services/file-upload'
import { Decimal } from 'decimal.js'

export async function PATCH(
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

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }

    // Проверяем, что пользователь - владелец услуги
    if (order.specialistProfile.userId !== user.id) {
      return NextResponse.json({ error: 'Нет прав для завершения заказа' }, { status: 403 })
    }

    // Проверяем статус заказа
    if (!['paid', 'in_progress'].includes(order.status)) {
      return NextResponse.json({ error: 'Заказ нельзя завершить' }, { status: 400 })
    }

    // Парсим данные формы
    const formData = await request.formData()
    const screenshot = formData.get('screenshot') as File
    const description = formData.get('description') as string

    // Валидация
    if (!screenshot || !description?.trim()) {
      return NextResponse.json(
        { error: 'Нужно загрузить скриншот и описание' }, 
        { status: 400 }
      )
    }

    // Валидируем и загружаем скриншот
    let screenshotUrl: string
    try {
      screenshotUrl = await FileUploadService.uploadResultScreenshot(screenshot)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Ошибка загрузки файла' }, 
        { status: 400 }
      )
    }

    // Завершаем заказ в транзакции
    await prisma.$transaction(async (tx) => {
      // Переводим баллы специалисту
      if (order.pointsUsed > 0) {
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
          resultScreenshot: screenshotUrl,
          resultDescription: description.trim(),
          completedAt: new Date(),
          verifiedAt: new Date()
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Заказ успешно завершен! Баллы переведены.'
    })

  } catch (error) {
    console.error('Ошибка завершения заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка завершения заказа' }, 
      { status: 500 }
    )
  }
}

