/**
 * Серверные утилиты для проверки авторизации
 */

import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

/**
 * Получить текущего авторизованного специалиста
 * Возвращает null если не авторизован
 */
export async function getCurrentSpecialist() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value

  if (!sessionToken) {
    return null
  }

  const session = await prisma.authSession.findFirst({
    where: {
      sessionToken,
      expiresAt: { gt: new Date() }
    },
    include: {
      specialist: true
    }
  })

  if (!session) {
    return null
  }

  return session.specialist
}

/**
 * Проверить, является ли текущий пользователь владельцем профиля
 */
export async function isProfileOwner(specialistId: string): Promise<boolean> {
  const currentSpecialist = await getCurrentSpecialist()
  
  if (!currentSpecialist) {
    return false
  }

  return currentSpecialist.id === specialistId
}

/**
 * Получить сессионный токен из cookies
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('session_token')?.value || null
}

