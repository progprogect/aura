/**
 * API для получения покупок пользователя
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  try {
    // Получаем текущего пользователя
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // Фильтр по статусу
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Строим условия фильтрации
    const where: any = {
      // Ищем заказы по ID пользователя (приоритет) или по номеру телефона (fallback)
      OR: [
        { clientUserId: user.id },
        { clientContact: user.phone }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // Получаем заказы с пагинацией
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              title: true,
              emoji: true,
              slug: true,
              price: true,
              currency: true
            }
          },
          specialistProfile: {
            select: {
              slug: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          review: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    // Подсчитываем статистику
    const stats = await prisma.order.groupBy({
      by: ['status'],
      where,
      _count: true
    })

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: total,
        paid: statusCounts.paid || 0,
        completed: statusCounts.completed || 0,
        cancelled: statusCounts.cancelled || 0,
        disputed: statusCounts.disputed || 0
      }
    })

  } catch (error) {
    console.error('Ошибка получения покупок:', error)
    return NextResponse.json(
      { error: 'Ошибка получения покупок' }, 
      { status: 500 }
    )
  }
}
