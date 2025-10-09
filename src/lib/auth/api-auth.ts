/**
 * Утилиты для проверки авторизации в API routes (Unified)
 * DRY принцип - используем везде вместо дублирования
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export interface AuthSession {
  sessionToken: string
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
    email: string | null
    avatar: string | null
  }
  specialistProfile: {
    id: string
    slug: string
    category: string
    verified: boolean
  } | null
}

/**
 * Получить авторизованную сессию из request (Unified)
 * Возвращает null если не авторизован или сессия истекла
 */
export async function getAuthSession(request: NextRequest): Promise<AuthSession | null> {
  const sessionToken = request.cookies.get('session_token')?.value
  
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
          specialistProfile: {
            select: {
              id: true,
              slug: true,
              category: true,
              verified: true
            }
          }
        }
      }
    }
  })

  if (!session || !session.user) {
    return null
  }

  return {
    sessionToken: session.sessionToken,
    userId: session.user.id,
    user: {
      id: session.user.id,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      phone: session.user.phone,
      email: session.user.email,
      avatar: session.user.avatar
    },
    specialistProfile: session.user.specialistProfile || null
  }
}

/**
 * Стандартный ответ для неавторизованных запросов
 */
export const UNAUTHORIZED_RESPONSE = {
  success: false,
  error: 'Не авторизован'
}

/**
 * Стандартный ответ для истекших сессий
 */
export const SESSION_EXPIRED_RESPONSE = {
  success: false,
  error: 'Сессия истекла'
}

