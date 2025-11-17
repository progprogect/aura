/**
 * API для аналитики покупок лид-магнитов специалиста
 * GET - получение статистики покупок
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
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

    const specialistProfileId = session.specialistProfile.id

    // Получаем все покупки лид-магнитов специалиста
    const purchases = await prisma.leadMagnetPurchase.findMany({
      where: {
        specialistProfileId
      },
      include: {
        leadMagnet: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Агрегируем статистику
    const totalPurchases = purchases.length
    const totalRevenue = purchases.reduce((sum, p) => {
      return sum + Number(p.pointsSpent)
    }, 0)

    // Статистика по каждому лид-магниту
    const byLeadMagnet = purchases.reduce((acc, purchase) => {
      const leadMagnetId = purchase.leadMagnetId
      const leadMagnetTitle = purchase.leadMagnet.title

      if (!acc[leadMagnetId]) {
        acc[leadMagnetId] = {
          leadMagnetId,
          leadMagnetTitle,
          purchaseCount: 0,
          revenue: 0
        }
      }

      acc[leadMagnetId].purchaseCount++
      acc[leadMagnetId].revenue += Number(purchase.pointsSpent)

      return acc
    }, {} as Record<string, {
      leadMagnetId: string
      leadMagnetTitle: string
      purchaseCount: number
      revenue: number
    }>)

    return NextResponse.json({
      success: true,
      stats: {
        totalPurchases,
        totalRevenue,
        byLeadMagnet: Object.values(byLeadMagnet).sort((a, b) => b.purchaseCount - a.purchaseCount)
      }
    })

  } catch (error) {
    console.error('[API/lead-magnets/analytics] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

