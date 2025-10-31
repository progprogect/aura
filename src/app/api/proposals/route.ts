/**
 * API для получения списка откликов специалиста
 * GET - мои отклики (только для специалистов)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    if (!session.specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Только специалисты могут просматривать свои отклики' },
        { status: 403 }
      )
    }

    // Гарантируем, что specialistProfile существует
    const specialistProfileId = session.specialistProfile.id

    // Получаем query параметры
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {
      specialistId: specialistProfileId
    }

    if (status) {
      where.status = status
    }

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        request: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            budget: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      proposals
    })

  } catch (error) {
    console.error('[API/proposals/GET] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при получении откликов' },
      { status: 500 }
    )
  }
}

