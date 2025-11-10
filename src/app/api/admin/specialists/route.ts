/**
 * API endpoint для получения списка специалистов
 * GET /api/admin/specialists
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/permissions'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const verified = searchParams.get('verified')
    const blocked = searchParams.get('blocked')
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Строим условия фильтрации
    const where: any = {}

    if (search) {
      where.OR = [
        { slug: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ]
    }

    if (verified !== null && verified !== undefined) {
      where.verified = verified === 'true'
    }

    if (blocked !== null && blocked !== undefined) {
      where.blocked = blocked === 'true'
    }

    if (category) {
      where.category = category
    }

    // Сортировка
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Подсчет общего количества
    const total = await prisma.specialistProfile.count({ where })

    // Получение специалистов
    const specialists = await prisma.specialistProfile.findMany({
      where,
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
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({
      success: true,
      specialists: specialists.map((s) => ({
        id: s.id,
        slug: s.slug,
        category: s.category,
        specializations: s.specializations,
        verified: s.verified,
        verifiedAt: s.verifiedAt,
        blocked: s.blocked,
        blockedAt: s.blockedAt,
        blockedReason: s.blockedReason,
        acceptingClients: s.acceptingClients,
        profileViews: s.profileViews,
        contactViews: s.contactViews,
        averageRating: s.averageRating,
        totalReviews: s.totalReviews,
        createdAt: s.createdAt,
        user: s.user,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Ошибка получения списка специалистов:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

