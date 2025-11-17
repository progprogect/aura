/**
 * API для получения комиссий по специалисту
 * GET /api/admin/revenue/specialist/[specialistId]
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/permissions'
import { prisma } from '@/lib/db'
import { Decimal } from 'decimal.js'

export async function GET(
  request: NextRequest,
  { params }: { params: { specialistId: string } }
) {
  try {
    await requireAdmin(request)

    const specialistId = params.specialistId

    // Получаем профиль специалиста
    const specialist = await prisma.specialistProfile.findUnique({
      where: { id: specialistId },
      select: { userId: true },
    })

    if (!specialist) {
      return NextResponse.json(
        { success: false, error: 'Специалист не найден' },
        { status: 404 }
      )
    }

    // Получаем все транзакции специалиста
    const revenues = await prisma.platformRevenue.findMany({
      where: {
        specialistUserId: specialist.userId,
        status: 'completed',
      },
      orderBy: { createdAt: 'desc' },
    })

    // Агрегируем статистику
    const totalCommission = revenues.reduce(
      (sum, r) => sum.add(new Decimal(r.commissionAmount)),
      new Decimal(0)
    )
    const totalReceived = revenues.reduce((sum, r) => {
      // Специалист получил: сумма - комиссия
      const amount = new Decimal(r.commissionAmount).div(0.05).sub(
        new Decimal(r.commissionAmount)
      )
      return sum.add(amount)
    }, new Decimal(0))

    // Статистика по типам
    const byType = {
      leadMagnet: revenues.filter((r) => r.leadMagnetPurchaseId).length,
      service: revenues.filter((r) => r.orderId).length,
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalCommission: totalCommission.toString(),
        totalReceived: totalReceived.toString(),
        totalTransactions: revenues.length,
        byType,
      },
      revenues,
    })
  } catch (error) {
    console.error('[API/admin/revenue/specialist] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

