/**
 * API для получения заказов специалиста
 * GET /api/specialist/orders
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

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

    // Получаем все заказы специалиста
    const orders = await prisma.order.findMany({
      where: {
        specialistProfileId: session.specialistProfile.id
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            emoji: true,
            price: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Новые сверху
      }
    })

    // Подсчитываем статистику
    const pendingCount = orders.filter(o => o.status === 'pending').length
    const inProgressCount = orders.filter(o => o.status === 'in_progress').length
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const totalThisWeek = orders.filter(o => o.createdAt >= weekAgo).length

    return NextResponse.json({
      success: true,
      orders,
      stats: {
        pendingCount,
        inProgressCount,
        totalThisWeek,
        total: orders.length
      }
    })

  } catch (error) {
    console.error('[API/specialist/orders] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

