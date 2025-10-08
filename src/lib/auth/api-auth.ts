/**
 * Утилиты для проверки авторизации в API routes
 * DRY принцип - используем везде вместо дублирования
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export interface AuthSession {
  sessionToken: string
  specialistId: string
  specialist: any
}

/**
 * Получить авторизованную сессию из request
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
      expiresAt: { gt: new Date() }
    },
    include: {
      specialist: true
    }
  })

  if (!session) {
    return null
  }

  return {
    sessionToken: session.sessionToken,
    specialistId: session.specialistId,
    specialist: session.specialist
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

