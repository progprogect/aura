/**
 * API для получения общей статистики комиссий и кешбэка
 * GET /api/admin/revenue/overview
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/permissions'
import { prisma } from '@/lib/db'
import { Decimal } from 'decimal.js'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Периоды для фильтрации
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'all' // 'day' | 'week' | 'month' | 'year' | 'all'

    // Вычисляем даты для периодов
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

    const periodStart =
      period === 'day'
        ? dayAgo
        : period === 'week'
        ? weekAgo
        : period === 'month'
        ? monthAgo
        : period === 'year'
        ? yearAgo
        : null

    // Запрос для фильтрации по периоду
    const whereClause = periodStart
      ? {
          createdAt: { gte: periodStart },
          status: 'completed',
        }
      : { status: 'completed' }

    // Агрегируем данные
    const revenues = await prisma.platformRevenue.findMany({
      where: whereClause,
      select: {
        commissionAmount: true,
        cashbackAmount: true,
        netRevenue: true,
        type: true,
        orderId: true,
        leadMagnetPurchaseId: true,
      },
    })

    // Общая статистика
    const totalCommission = revenues.reduce(
      (sum, r) => sum.add(new Decimal(r.commissionAmount)),
      new Decimal(0)
    )
    const totalCashback = revenues.reduce(
      (sum, r) => sum.add(new Decimal(r.cashbackAmount)),
      new Decimal(0)
    )
    const totalNetRevenue = revenues.reduce(
      (sum, r) => sum.add(new Decimal(r.netRevenue)),
      new Decimal(0)
    )

    // Статистика по типам
    const byType = {
      leadMagnet: {
        commission: new Decimal(0),
        cashback: new Decimal(0),
        netRevenue: new Decimal(0),
        count: 0,
      },
      service: {
        commission: new Decimal(0),
        cashback: new Decimal(0),
        netRevenue: new Decimal(0),
        count: 0,
      },
    }

    revenues.forEach((r) => {
      if (r.leadMagnetPurchaseId) {
        byType.leadMagnet.commission = byType.leadMagnet.commission.add(
          new Decimal(r.commissionAmount)
        )
        byType.leadMagnet.cashback = byType.leadMagnet.cashback.add(
          new Decimal(r.cashbackAmount)
        )
        byType.leadMagnet.netRevenue = byType.leadMagnet.netRevenue.add(
          new Decimal(r.netRevenue)
        )
        byType.leadMagnet.count++
      } else if (r.orderId) {
        byType.service.commission = byType.service.commission.add(
          new Decimal(r.commissionAmount)
        )
        byType.service.cashback = byType.service.cashback.add(
          new Decimal(r.cashbackAmount)
        )
        byType.service.netRevenue = byType.service.netRevenue.add(
          new Decimal(r.netRevenue)
        )
        byType.service.count++
      }
    })

    // Статистика по периодам
    const byPeriod = {
      day: await getPeriodStats(dayAgo, now),
      week: await getPeriodStats(weekAgo, now),
      month: await getPeriodStats(monthAgo, now),
      year: await getPeriodStats(yearAgo, now),
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalCommission: totalCommission.toString(),
        totalCashback: totalCashback.toString(),
        totalNetRevenue: totalNetRevenue.toString(),
        totalTransactions: revenues.length,
        byType: {
          leadMagnet: {
            commission: byType.leadMagnet.commission.toString(),
            cashback: byType.leadMagnet.cashback.toString(),
            netRevenue: byType.leadMagnet.netRevenue.toString(),
            count: byType.leadMagnet.count,
          },
          service: {
            commission: byType.service.commission.toString(),
            cashback: byType.service.cashback.toString(),
            netRevenue: byType.service.netRevenue.toString(),
            count: byType.service.count,
          },
        },
        byPeriod,
        period: {
          type: period,
          start: periodStart?.toISOString() || null,
        },
      },
    })
  } catch (error) {
    console.error('[API/admin/revenue/overview] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

async function getPeriodStats(start: Date, end: Date) {
  const revenues = await prisma.platformRevenue.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: 'completed',
    },
    select: {
      commissionAmount: true,
      cashbackAmount: true,
      netRevenue: true,
    },
  })

  const commission = revenues.reduce(
    (sum, r) => sum.add(new Decimal(r.commissionAmount)),
    new Decimal(0)
  )
  const cashback = revenues.reduce(
    (sum, r) => sum.add(new Decimal(r.cashbackAmount)),
    new Decimal(0)
  )
  const netRevenue = revenues.reduce(
    (sum, r) => sum.add(new Decimal(r.netRevenue)),
    new Decimal(0)
  )

  return {
    commission: commission.toString(),
    cashback: cashback.toString(),
    netRevenue: netRevenue.toString(),
    count: revenues.length,
  }
}

