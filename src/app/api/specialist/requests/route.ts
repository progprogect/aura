/**
 * API для получения заявок специалиста
 * GET /api/specialist/requests
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

    // Получаем все заявки специалиста
    const requests = await prisma.consultationRequest.findMany({
      where: {
        specialistId: session.specialistId
      },
      orderBy: {
        createdAt: 'desc' // Новые сверху
      }
    })

    // Подсчитываем статистику
    const newCount = requests.filter(r => r.status === 'new').length
    const totalThisWeek = requests.filter(r => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return r.createdAt >= weekAgo
    }).length

    return NextResponse.json({
      success: true,
      requests,
      stats: {
        newCount,
        totalThisWeek,
        total: requests.length
      }
    })

  } catch (error) {
    console.error('[API/specialist/requests] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

