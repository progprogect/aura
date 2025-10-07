/**
 * Сервис для работы с сессиями авторизации
 */

import { prisma } from '@/lib/db'
import { generateSessionToken, generateDeviceFingerprint, getSessionExpiryTime, isExpired, debugLog } from './utils'
import { AUTH_CONFIG } from './config'
import type { SessionData, AuthSession } from './types'

// ========================================
// СОЗДАНИЕ СЕССИИ
// ========================================

export async function createSession(
  specialistId: string,
  userAgent?: string,
  ipAddress?: string,
  deviceFingerprint?: string
): Promise<SessionData> {
  try {
    debugLog('Создание сессии', { specialistId })
    
    // Генерируем токен сессии
    const sessionToken = generateSessionToken()
    
    // Создаём отпечаток устройства если не передан
    const fingerprint = deviceFingerprint || generateDeviceFingerprint(userAgent || '')
    
    // Определяем время истечения
    const expiresAt = getSessionExpiryTime(30) // 30 дней
    
    // Проверяем количество активных сессий
    await cleanupOldSessions(specialistId)
    
    // Создаём сессию в базе
    const session = await prisma.authSession.create({
      data: {
        specialistId,
        sessionToken,
        deviceFingerprint: fingerprint,
        userAgent,
        ipAddress,
        expiresAt,
        isActive: true
      }
    })
    
    debugLog('Сессия создана', { sessionId: session.id, specialistId })
    
    return {
      specialistId,
      sessionToken,
      expiresAt,
      userAgent,
      deviceFingerprint: fingerprint
    }
    
  } catch (error) {
    debugLog('Ошибка создания сессии', error)
    throw new Error('Не удалось создать сессию')
  }
}

// ========================================
// ПРОВЕРКА СЕССИИ
// ========================================

export async function validateSession(sessionToken: string): Promise<{
  valid: boolean
  session?: AuthSession
  specialistId?: string
  error?: string
}> {
  try {
    debugLog('Проверка сессии', { sessionToken: sessionToken.slice(0, 8) + '...' })
    
    // Ищем сессию в базе
    const session = await prisma.authSession.findUnique({
      where: { sessionToken },
      include: {
        specialist: true
      }
    })
    
    if (!session) {
      return {
        valid: false,
        error: 'Сессия не найдена'
      }
    }
    
    // Проверяем активность
    if (!session.isActive) {
      return {
        valid: false,
        error: 'Сессия неактивна'
      }
    }
    
    // Проверяем срок действия
    if (isExpired(session.expiresAt)) {
      // Помечаем как неактивную
      await prisma.authSession.update({
        where: { id: session.id },
        data: { isActive: false }
      })
      
      return {
        valid: false,
        error: 'Сессия истекла'
      }
    }
    
    // Обновляем время последнего использования
    await prisma.authSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() }
    })
    
    // Автоматически продлеваем сессию если включено
    if (AUTH_CONFIG.session.autoExtend) {
      const newExpiresAt = getSessionExpiryTime(30)
      await prisma.authSession.update({
        where: { id: session.id },
        data: { expiresAt: newExpiresAt }
      })
    }
    
    debugLog('Сессия валидна', { sessionId: session.id, specialistId: session.specialistId })
    
    return {
      valid: true,
      session,
      specialistId: session.specialistId
    }
    
  } catch (error) {
    debugLog('Ошибка проверки сессии', error)
    return {
      valid: false,
      error: 'Ошибка проверки сессии'
    }
  }
}

// ========================================
// ОБНОВЛЕНИЕ СЕССИИ
// ========================================

export async function updateSession(
  sessionToken: string,
  updates: {
    userAgent?: string
    ipAddress?: string
    deviceFingerprint?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    debugLog('Обновление сессии', { sessionToken: sessionToken.slice(0, 8) + '...' })
    
    await prisma.authSession.update({
      where: { sessionToken },
      data: {
        ...updates,
        lastUsedAt: new Date()
      }
    })
    
    return { success: true }
    
  } catch (error) {
    debugLog('Ошибка обновления сессии', error)
    return {
      success: false,
      error: 'Не удалось обновить сессию'
    }
  }
}

// ========================================
// УДАЛЕНИЕ СЕССИИ
// ========================================

export async function revokeSession(sessionToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    debugLog('Отзыв сессии', { sessionToken: sessionToken.slice(0, 8) + '...' })
    
    await prisma.authSession.update({
      where: { sessionToken },
      data: { isActive: false }
    })
    
    return { success: true }
    
  } catch (error) {
    debugLog('Ошибка отзыва сессии', error)
    return {
      success: false,
      error: 'Не удалось отозвать сессию'
    }
  }
}

// ========================================
// УДАЛЕНИЕ ВСЕХ СЕССИЙ ПОЛЬЗОВАТЕЛЯ
// ========================================

export async function revokeAllSessions(specialistId: string): Promise<{ success: boolean; error?: string }> {
  try {
    debugLog('Отзыв всех сессий', { specialistId })
    
    await prisma.authSession.updateMany({
      where: { specialistId },
      data: { isActive: false }
    })
    
    return { success: true }
    
  } catch (error) {
    debugLog('Ошибка отзыва всех сессий', error)
    return {
      success: false,
      error: 'Не удалось отозвать все сессии'
    }
  }
}

// ========================================
// ПОЛУЧЕНИЕ СЕССИЙ ПОЛЬЗОВАТЕЛЯ
// ========================================

export async function getUserSessions(specialistId: string): Promise<AuthSession[]> {
  try {
    const sessions = await prisma.authSession.findMany({
      where: {
        specialistId,
        isActive: true
      },
      orderBy: {
        lastUsedAt: 'desc'
      }
    })
    
    return sessions
    
  } catch (error) {
    debugLog('Ошибка получения сессий пользователя', error)
    return []
  }
}

// ========================================
// ВНУТРЕННИЕ ФУНКЦИИ
// ========================================

async function cleanupOldSessions(specialistId: string): Promise<void> {
  try {
    // Получаем количество активных сессий
    const activeSessionsCount = await prisma.authSession.count({
      where: {
        specialistId,
        isActive: true
      }
    })
    
    // Если превышен лимит, удаляем самые старые
    if (activeSessionsCount >= AUTH_CONFIG.session.maxDevices) {
      const sessionsToDelete = await prisma.authSession.findMany({
        where: {
          specialistId,
          isActive: true
        },
        orderBy: {
          lastUsedAt: 'asc'
        },
        take: activeSessionsCount - AUTH_CONFIG.session.maxDevices + 1
      })
      
      for (const session of sessionsToDelete) {
        await prisma.authSession.update({
          where: { id: session.id },
          data: { isActive: false }
        })
      }
      
      debugLog('Очистка старых сессий', { 
        specialistId, 
        deleted: sessionsToDelete.length 
      })
    }
    
  } catch (error) {
    debugLog('Ошибка очистки старых сессий', error)
  }
}

// ========================================
// УТИЛИТЫ
// ========================================

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const result = await prisma.authSession.updateMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        isActive: true
      },
      data: {
        isActive: false
      }
    })
    
    debugLog('Очистка истёкших сессий', { updated: result.count })
    
  } catch (error) {
    debugLog('Ошибка очистки истёкших сессий', error)
  }
}

export async function getSessionStats(specialistId: string): Promise<{
  activeSessions: number
  totalSessions: number
  lastActivity?: Date
}> {
  try {
    const [activeCount, totalCount, lastSession] = await Promise.all([
      prisma.authSession.count({
        where: {
          specialistId,
          isActive: true
        }
      }),
      prisma.authSession.count({
        where: { specialistId }
      }),
      prisma.authSession.findFirst({
        where: { specialistId },
        orderBy: { lastUsedAt: 'desc' },
        select: { lastUsedAt: true }
      })
    ])
    
    return {
      activeSessions: activeCount,
      totalSessions: totalCount,
      lastActivity: lastSession?.lastUsedAt
    }
    
  } catch (error) {
    debugLog('Ошибка получения статистики сессий', error)
    return {
      activeSessions: 0,
      totalSessions: 0
    }
  }
}

export function extractSessionFromRequest(request: Request): string | null {
  // Пытаемся получить токен из заголовка Authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  
  // Пытаемся получить из cookie
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    return cookies['session_token'] || null
  }
  
  return null
}
