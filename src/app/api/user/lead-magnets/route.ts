/**
 * API для получения купленных лид-магнитов пользователя
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/server'
import { fromPrismaLeadMagnet } from '@/types/lead-magnet'

export async function GET(request: NextRequest) {
  try {
    // Получаем текущего пользователя
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Получаем покупки лид-магнитов с пагинацией
    const [purchases, total] = await Promise.all([
      prisma.leadMagnetPurchase.findMany({
        where: {
          userId: user.id
        },
        include: {
          leadMagnet: {
            include: {
              specialistProfile: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.leadMagnetPurchase.count({
        where: {
          userId: user.id
        }
      })
    ])

    // Форматируем данные
    const leadMagnets = purchases.map(purchase => ({
      purchaseId: purchase.id,
      purchasedAt: purchase.createdAt,
      priceInPoints: purchase.priceInPoints,
      pointsSpent: purchase.pointsSpent,
      leadMagnet: fromPrismaLeadMagnet(purchase.leadMagnet),
      specialist: {
        slug: purchase.leadMagnet.specialistProfile.slug,
        name: `${purchase.leadMagnet.specialistProfile.user.firstName} ${purchase.leadMagnet.specialistProfile.user.lastName}`,
        avatar: purchase.leadMagnet.specialistProfile.user.avatar
      }
    }))

    return NextResponse.json({
      leadMagnets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Ошибка получения купленных лид-магнитов:', error)
    return NextResponse.json(
      { error: 'Ошибка получения купленных лид-магнитов' },
      { status: 500 }
    )
  }
}

