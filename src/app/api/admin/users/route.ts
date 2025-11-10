/**
 * API endpoint для получения списка пользователей
 * GET /api/admin/users
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
    const blocked = searchParams.get('blocked')
    const hasSpecialistProfile = searchParams.get('hasSpecialistProfile')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Строим условия фильтрации
    const where: any = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (blocked !== null && blocked !== undefined) {
      where.blocked = blocked === 'true'
    }

    if (hasSpecialistProfile !== null && hasSpecialistProfile !== undefined) {
      if (hasSpecialistProfile === 'true') {
        where.specialistProfile = { isNot: null }
      } else {
        where.specialistProfile = null
      }
    }

    // Сортировка
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Подсчет общего количества
    const total = await prisma.user.count({ where })

    // Получение пользователей
    const users = await prisma.user.findMany({
      where,
      include: {
        specialistProfile: {
          select: {
            id: true,
            slug: true,
            category: true,
            verified: true,
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
      users: users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        email: u.email,
        avatar: u.avatar,
        blocked: u.blocked,
        blockedAt: u.blockedAt,
        blockedReason: u.blockedReason,
        balance: u.balance.toString(),
        bonusBalance: u.bonusBalance.toString(),
        hasSpecialistProfile: !!u.specialistProfile,
        specialistProfile: u.specialistProfile,
        createdAt: u.createdAt,
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
    console.error('Ошибка получения списка пользователей:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

