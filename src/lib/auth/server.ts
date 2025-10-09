/**
 * Серверные утилиты для проверки авторизации (Unified)
 */

import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

/**
 * Получить текущего авторизованного пользователя (с профилем специалиста если есть)
 * Возвращает null если не авторизован
 */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value

  if (!sessionToken) {
    return null
  }

  const session = await prisma.authSession.findFirst({
    where: {
      sessionToken,
      expiresAt: { gt: new Date() },
      isActive: true
    },
    include: {
      user: {
        include: {
          specialistProfile: true
        }
      }
    }
  })

  if (!session) {
    return null
  }

  return session.user
}

/**
 * Получить текущего специалиста (legacy compatibility)
 * Возвращает объект с полями как у старой модели Specialist
 */
export async function getCurrentSpecialist() {
  const user = await getCurrentUser()
  
  if (!user || !user.specialistProfile) {
    return null
  }

  // Преобразуем в формат старой модели для обратной совместимости
  const profile = user.specialistProfile
  return {
    id: profile.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    slug: profile.slug,
    category: profile.category,
    specializations: profile.specializations,
    tagline: profile.tagline,
    about: profile.about,
    city: profile.city,
    country: profile.country,
    workFormats: profile.workFormats,
    yearsOfPractice: profile.yearsOfPractice,
    telegram: profile.telegram,
    whatsapp: profile.whatsapp,
    instagram: profile.instagram,
    website: profile.website,
    priceFrom: profile.priceFrom,
    priceTo: profile.priceTo,
    currency: profile.currency,
    priceDescription: profile.priceDescription,
    customFields: profile.customFields,
    videoUrl: profile.videoUrl,
    verified: profile.verified,
    verifiedAt: profile.verifiedAt,
    acceptingClients: profile.acceptingClients,
    metaTitle: profile.metaTitle,
    metaDescription: profile.metaDescription,
    subscriptionTier: profile.subscriptionTier,
    profileViews: profile.profileViews,
    contactViews: profile.contactViews,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  }
}

/**
 * Проверить, является ли текущий пользователь владельцем профиля
 */
export async function isProfileOwner(specialistProfileId: string): Promise<boolean> {
  const currentSpecialist = await getCurrentSpecialist()
  
  if (!currentSpecialist) {
    return false
  }

  return currentSpecialist.id === specialistProfileId
}

/**
 * Получить сессионный токен из cookies
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('session_token')?.value || null
}

