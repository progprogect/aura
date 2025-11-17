/**
 * API для получения истории транзакций комиссий
 * GET /api/admin/revenue/transactions
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/permissions'
import { prisma } from '@/lib/db'
import { Decimal } from 'decimal.js'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') // 'commission' | 'cashback_paid' | 'refund'
    const userId = searchParams.get('userId')
    const specialistId = searchParams.get('specialistId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Формируем условия фильтрации
    const where: any = {}

    if (type) {
      where.type = type
    }

    if (userId) {
      where.clientUserId = userId
    }

    if (specialistId) {
      where.specialistUserId = specialistId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Получаем транзакции
    const [revenues, total] = await Promise.all([
      prisma.platformRevenue.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.platformRevenue.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      revenues: revenues.map((r) => ({
        ...r,
        commissionAmount: new Decimal(r.commissionAmount).toString(),
        cashbackAmount: new Decimal(r.cashbackAmount).toString(),
        netRevenue: new Decimal(r.netRevenue).toString(),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[API/admin/revenue/transactions] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

