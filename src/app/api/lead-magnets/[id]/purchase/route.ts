/**
 * API для покупки лид-магнита
 * POST /api/lead-magnets/[id]/purchase
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/server'
import { PointsService } from '@/lib/points/points-service'
import { CommissionService } from '@/lib/commission/commission-service'
import { Decimal } from 'decimal.js'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверка авторизации
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      )
    }

    // Получаем лид-магнит
    const leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id: params.id },
      include: {
        specialistProfile: {
          include: {
            user: {
              select: { id: true }
            }
          }
        }
      }
    })

    if (!leadMagnet) {
      return NextResponse.json(
        { success: false, error: 'Лид-магнит не найден' },
        { status: 404 }
      )
    }

    if (!leadMagnet.isActive) {
      return NextResponse.json(
        { success: false, error: 'Лид-магнит недоступен' },
        { status: 400 }
      )
    }

    // Если бесплатный - сразу возвращаем URL
    if (leadMagnet.priceInPoints === null || leadMagnet.priceInPoints === 0) {
      const accessUrl = leadMagnet.type === 'file' 
        ? leadMagnet.fileUrl 
        : leadMagnet.linkUrl

      if (!accessUrl) {
        return NextResponse.json(
          { success: false, error: 'URL доступа не найден' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        accessUrl,
        isFree: true
      })
    }

    // Проверяем, не покупает ли пользователь у себя самого
    if (leadMagnet.specialistProfile.userId === user.id) {
      // Если это свой лид-магнит - возвращаем доступ бесплатно
      const accessUrl = leadMagnet.type === 'file' 
        ? leadMagnet.fileUrl 
        : leadMagnet.linkUrl

      if (!accessUrl) {
        return NextResponse.json(
          { success: false, error: 'URL доступа не найден' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        accessUrl,
        isOwn: true
      })
    }

    // Проверяем баланс (быстрая проверка перед транзакцией)
    const priceInPoints = leadMagnet.priceInPoints
    const balance = await PointsService.getBalance(user.id)
    
    if (balance.total.lt(priceInPoints)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Недостаточно баллов',
          code: 'INSUFFICIENT_POINTS',
          required: priceInPoints,
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
      console.warn('[API/lead-magnets/purchase] Системный пользователь не найден, комиссия не будет начислена')
    }

    // Покупка в транзакции (все проверки внутри для атомарности)
    const result = await prisma.$transaction(async (tx) => {
      // Проверяем повторную покупку внутри транзакции (защита от race condition)
      const existingPurchase = await tx.leadMagnetPurchase.findFirst({
        where: {
          leadMagnetId: leadMagnet.id,
          userId: user.id
        }
      })

      if (existingPurchase) {
        // Если уже купил - возвращаем доступ без списания баллов
        const accessUrl = leadMagnet.type === 'file' 
          ? leadMagnet.fileUrl 
          : leadMagnet.linkUrl

        if (!accessUrl) {
          throw new Error('URL доступа не найден')
        }

        return {
          purchase: existingPurchase,
          transactionId: existingPurchase.transactionId,
          accessUrl,
          alreadyPurchased: true
        }
      }

      // Списываем баллы
      const transactions = await PointsService.deductPoints(
        user.id,
        new Decimal(priceInPoints),
        'lead_magnet_purchase',
        `Покупка лид-магнита: ${leadMagnet.title}`,
        {
          leadMagnetId: leadMagnet.id,
          leadMagnetTitle: leadMagnet.title,
          specialistId: leadMagnet.specialistProfile.userId
        }
      )

      // Получаем ID первой транзакции (может быть несколько, если использовались бонусы)
      const transactionId = transactions[0]?.id || null

      // Получаем фактически потраченную сумму (может отличаться из-за бонусов)
      // amount отрицательный для списания, берем абсолютное значение
      const pointsSpent = transactions.reduce((sum, t) => {
        return sum.add(new Decimal(t.amount).abs())
      }, new Decimal(0))

      // Создаем запись о покупке для аналитики
      const purchase = await tx.leadMagnetPurchase.create({
        data: {
          leadMagnetId: leadMagnet.id,
          specialistProfileId: leadMagnet.specialistProfileId,
          userId: user.id,
          priceInPoints,
          pointsSpent: pointsSpent.toNumber(),
          transactionId
        }
      })

      // Обрабатываем комиссию и кешбэк (только если системный пользователь существует)
      if (platformUserId) {
        try {
          await CommissionService.processLeadMagnetPurchase(
            tx,
            purchase.id,
            user.id,
            leadMagnet.specialistProfile.userId,
            new Decimal(priceInPoints),
            platformUserId
          )
        } catch (commissionError) {
          console.error('[API/lead-magnets/purchase] Ошибка обработки комиссии:', commissionError)
          throw commissionError
        }
      }

      return {
        purchase,
        transactionId,
        accessUrl: leadMagnet.type === 'file' ? leadMagnet.fileUrl : leadMagnet.linkUrl
      }
    })

    if (!result.accessUrl) {
      return NextResponse.json(
        { success: false, error: 'URL доступа не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      accessUrl: result.accessUrl,
      transactionId: result.transactionId,
      purchaseId: result.purchase?.id,
      alreadyPurchased: result.alreadyPurchased || false
    })

  } catch (error) {
    console.error('[API/lead-magnets/purchase] Ошибка:', error)

    if (error instanceof Error && (error.message.includes('Insufficient balance') || error.message.includes('Недостаточно баллов'))) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно баллов для покупки' },
        { status: 400 }
      )
    }

    // Обработка ошибки "URL доступа не найден" из транзакции
    if (error instanceof Error && error.message.includes('URL доступа не найден')) {
      return NextResponse.json(
        { success: false, error: 'URL доступа не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка покупки лид-магнита' },
      { status: 500 }
    )
  }
}

