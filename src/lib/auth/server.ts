/**
 * Серверные утилиты для проверки авторизации (Unified)
 */

import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { generateSlug } from '@/lib/utils/slug'

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

/**
 * Убедиться, что у профиля специалиста есть валидный slug
 * Если slug отсутствует или пустой - генерирует новый
 */
export async function ensureSlugExists(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialistProfile: true }
    })

    if (!user || !user.specialistProfile) {
      console.log('[ensureSlugExists] Профиль специалиста не найден для userId:', userId)
      return null
    }

    const profile = user.specialistProfile

    // Если slug уже существует и валиден - возвращаем его
    if (profile.slug && profile.slug.trim().length > 0) {
      return profile.slug
    }

    // Генерируем новый slug с транслитерацией
    console.warn('[ensureSlugExists] Slug отсутствует для профиля', profile.id, '- генерируем новый')
    
    const baseSlug = generateSlug(`${user.firstName} ${user.lastName}`) || 'specialist'
    let slug = baseSlug
    let counter = 1

    // Ищем уникальный slug
    while (true) {
      const existing = await prisma.specialistProfile.findUnique({
        where: { slug }
      })

      if (!existing || existing.id === profile.id) {
        break
      }

      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Обновляем профиль
    await prisma.specialistProfile.update({
      where: { id: profile.id },
      data: { slug }
    })

    console.log('[ensureSlugExists] Создан новый slug:', slug, 'для профиля', profile.id)
    return slug

  } catch (error) {
    console.error('[ensureSlugExists] Ошибка:', error)
    return null
  }
}

