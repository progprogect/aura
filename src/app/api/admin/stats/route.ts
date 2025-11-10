/**
 * API endpoint для получения общей статистики админ-панели
 * GET /api/admin/stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/permissions'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Периоды для фильтрации
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'all' // 'day' | 'week' | 'month' | 'all'

    // Вычисляем даты для периодов
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const periodStart = period === 'day' 
      ? dayAgo 
      : period === 'week' 
      ? weekAgo 
      : period === 'month' 
      ? monthAgo 
      : null

    // Пользователи
    const totalUsers = await prisma.user.count()
    const blockedUsers = await prisma.user.count({ where: { blocked: true } })
    const newUsers = periodStart
      ? await prisma.user.count({ where: { createdAt: { gte: periodStart } } })
      : 0

    // Специалисты
    const totalSpecialists = await prisma.specialistProfile.count()
    const verifiedSpecialists = await prisma.specialistProfile.count({
      where: { verified: true },
    })
    const blockedSpecialists = await prisma.specialistProfile.count({
      where: { blocked: true },
    })
    const newSpecialists = periodStart
      ? await prisma.specialistProfile.count({
          where: { createdAt: { gte: periodStart } },
        })
      : 0

    // Распределение по категориям
    const specialistsByCategory = await prisma.specialistProfile.groupBy({
      by: ['category'],
      _count: { category: true },
    })

    // Заказы
    const totalOrders = await prisma.order.count()
    const activeOrders = await prisma.order.count({
      where: { status: { in: ['pending', 'paid', 'in_progress'] } },
    })
    const completedOrders = await prisma.order.count({
      where: { status: 'completed' },
    })
    const cancelledOrders = await prisma.order.count({
      where: { status: 'cancelled' },
    })
    const newOrders = periodStart
      ? await prisma.order.count({
          where: { createdAt: { gte: periodStart } },
        })
      : 0

    // Конверсия заказов (из активных в завершенные)
    const conversionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

    // Баллы
    const usersWithBalance = await prisma.user.findMany({
      select: {
        balance: true,
        bonusBalance: true,
      },
    })

    const totalBalance = usersWithBalance.reduce(
      (sum, user) => sum + Number(user.balance),
      0
    )
    const totalBonusBalance = usersWithBalance.reduce(
      (sum, user) => sum + Number(user.bonusBalance),
      0
    )

    // Транзакции за период
    const transactionsQuery = periodStart
      ? { createdAt: { gte: periodStart } }
      : {}
    
    const transactions = await prisma.transaction.findMany({
      where: transactionsQuery,
      select: {
        type: true,
        amount: true,
        balanceType: true,
      },
    })

    const pointsGranted = transactions
      .filter((t) => ['bonus_registration', 'bonus_reward', 'deposit'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const pointsSpent = transactions
      .filter((t) => ['purchase', 'service_purchase', 'contact_view', 'request_received', 'package_purchase'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Активность
    const profileViews = await prisma.specialistProfile.aggregate({
      _sum: { profileViews: true },
    })

    const contactViews = await prisma.specialistProfile.aggregate({
      _sum: { contactViews: true },
    })

    const consultationRequests = periodStart
      ? await prisma.consultationRequest.count({
          where: { createdAt: { gte: periodStart } },
        })
      : await prisma.consultationRequest.count()

    const totalReviews = await prisma.review.count()
    const newReviews = periodStart
      ? await prisma.review.count({
          where: { createdAt: { gte: periodStart } },
        })
      : 0

    // Регистрации по дням (для графика) - используем raw query для группировки по дате
    const registrationsQuery = periodStart
      ? await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM "User"
        WHERE created_at >= ${periodStart}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `
      : await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM "User"
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `

    // Заказы по дням (для графика)
    const ordersQuery = periodStart
      ? await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM "Order"
        WHERE created_at >= ${periodStart}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `
      : await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM "Order"
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `

    const registrationsByDay = registrationsQuery.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      count: Number(item.count),
    }))

    const ordersByDay = ordersQuery.map((item) => ({
      date: item.date.toISOString().split('T')[0],
      count: Number(item.count),
    }))

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          blocked: blockedUsers,
          active: totalUsers - blockedUsers,
          new: newUsers,
        },
        specialists: {
          total: totalSpecialists,
          verified: verifiedSpecialists,
          blocked: blockedSpecialists,
          active: totalSpecialists - blockedSpecialists,
          new: newSpecialists,
          byCategory: specialistsByCategory.map((item) => ({
            category: item.category,
            count: item._count.category,
          })),
        },
        orders: {
          total: totalOrders,
          active: activeOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          new: newOrders,
          conversionRate: Math.round(conversionRate * 100) / 100,
        },
        points: {
          totalBalance: totalBalance,
          totalBonusBalance: totalBonusBalance,
          granted: pointsGranted,
          spent: pointsSpent,
        },
        activity: {
          profileViews: profileViews._sum.profileViews || 0,
          contactViews: contactViews._sum.contactViews || 0,
          consultationRequests,
          totalReviews,
          newReviews,
        },
        charts: {
          registrationsByDay,
          ordersByDay,
        },
        period: {
          type: period,
          start: periodStart?.toISOString() || null,
        },
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Ошибка получения статистики:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

