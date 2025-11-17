/**
 * API для получения комиссий и кешбэка по пользователю
 * GET /api/admin/revenue/user/[userId]
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/permissions'
import { prisma } from '@/lib/db'
import { Decimal } from 'decimal.js'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireAdmin(request)

    const userId = params.userId

    // Получаем все транзакции пользователя
    const revenues = await prisma.platformRevenue.findMany({
      where: {
        clientUserId: userId,
        status: 'completed',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        // Здесь можно добавить связи, если нужно
      },
    })

    // Агрегируем статистику
    const totalCommission = revenues.reduce(
      (sum, r) => sum.add(new Decimal(r.commissionAmount)),
      new Decimal(0)
    )
    const totalCashback = revenues.reduce(
      (sum, r) => sum.add(new Decimal(r.cashbackAmount)),
      new Decimal(0)
    )

    // Статистика по типам
    const byType = {
      leadMagnet: revenues.filter((r) => r.leadMagnetPurchaseId).length,
      service: revenues.filter((r) => r.orderId).length,
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalCommission: totalCommission.toNumber(),
        totalCashback: totalCashback.toNumber(),
        totalTransactions: revenues.length,
        byType,
      },
      revenues,
    })
  } catch (error) {
    console.error('[API/admin/revenue/user] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

