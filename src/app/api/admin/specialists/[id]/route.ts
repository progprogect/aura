/**
 * API endpoint для получения детальной информации о специалисте
 * GET /api/admin/specialists/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/permissions'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request)

    const specialist = await prisma.specialistProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            avatar: true,
            blocked: true,
            blockedAt: true,
            blockedReason: true,
            balance: true,
            bonusBalance: true,
            createdAt: true,
          },
        },
        education: {
          orderBy: { order: 'asc' },
        },
        certificates: {
          orderBy: { order: 'asc' },
        },
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            service: {
              select: {
                title: true,
                emoji: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    if (!specialist) {
      return NextResponse.json(
        { success: false, error: 'Специалист не найден' },
        { status: 404 }
      )
    }

    // Получаем транзакции пользователя
    const transactions = await prisma.transaction.findMany({
      where: { userId: specialist.userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    // Получаем статистику заказов
    const ordersStats = await prisma.order.groupBy({
      by: ['status'],
      where: { specialistProfileId: specialist.id },
      _count: { id: true },
    })

    return NextResponse.json({
      success: true,
      specialist: {
        ...specialist,
        transactions,
        ordersStats: ordersStats.map((stat) => ({
          status: stat.status,
          count: stat._count.id,
        })),
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Ошибка получения специалиста:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

