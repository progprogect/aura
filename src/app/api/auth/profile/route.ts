/**
 * API endpoint для получения профиля специалиста
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth/api-auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Используем новую утилиту для получения сессии из cookies
    const session = await getAuthSession(request)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Сессия не найдена' },
        { status: 401 }
      )
    }

    // Получаем профиль специалиста
    const specialist = await prisma.specialist.findUnique({
      where: { id: session.specialistId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        slug: true,
        category: true,
        specializations: true,
        verified: true,
        acceptingClients: true,
        tagline: true,
        about: true,
        city: true,
        phone: true,
        priceFrom: true,
        priceTo: true,
        yearsOfPractice: true,
        videoUrl: true,
      }
    })

    if (!specialist) {
      return NextResponse.json(
        { success: false, error: 'Специалист не найден' },
        { status: 404 }
      )
    }

    // Преобразуем в формат UserProfile
    const profile = {
      id: specialist.id,
      firstName: specialist.firstName,
      lastName: specialist.lastName,
      email: specialist.email,
      avatar: specialist.avatar,
      slug: specialist.slug,
      category: specialist.category,
      specializations: specialist.specializations,
      verified: specialist.verified,
      acceptingClients: specialist.acceptingClients,
      tagline: specialist.tagline,
      about: specialist.about,
      city: specialist.city,
      phone: specialist.phone,
      priceFrom: specialist.priceFrom,
      priceTo: specialist.priceTo,
      yearsOfPractice: specialist.yearsOfPractice,
      videoUrl: specialist.videoUrl,
    }

    return NextResponse.json({ 
      success: true, 
      profile 
    })

  } catch (error) {
    console.error('[API/auth/profile] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
