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

    if (!session.specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Профиль специалиста не найден' },
        { status: 404 }
      )
    }

    // Получаем полный профиль специалиста
    const specialistProfile = await prisma.specialistProfile.findUnique({
      where: { id: session.specialistProfile.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          }
        }
      }
    })

    if (!specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Специалист не найден' },
        { status: 404 }
      )
    }

    // Преобразуем в формат UserProfile
    const profile = {
      id: specialistProfile.id,
      firstName: specialistProfile.user.firstName,
      lastName: specialistProfile.user.lastName,
      email: specialistProfile.user.email,
      avatar: specialistProfile.user.avatar,
      phone: specialistProfile.user.phone,
      slug: specialistProfile.slug,
      profileType: specialistProfile.profileType || 'specialist',
      companyName: specialistProfile.companyName,
      address: specialistProfile.address,
      addressCoordinates: specialistProfile.addressCoordinates,
      taxId: specialistProfile.taxId,
      category: specialistProfile.category,
      specializations: specialistProfile.specializations,
      verified: specialistProfile.verified,
      acceptingClients: specialistProfile.acceptingClients,
      tagline: specialistProfile.tagline,
      about: specialistProfile.about,
      city: specialistProfile.city,
      priceFrom: specialistProfile.priceFrom,
      priceTo: specialistProfile.priceTo,
      yearsOfPractice: specialistProfile.yearsOfPractice,
      videoUrl: specialistProfile.videoUrl,
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
