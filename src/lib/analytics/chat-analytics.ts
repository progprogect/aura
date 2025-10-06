/**
 * Аналитика чата через Redis
 */

import { redis } from '@/lib/redis'
import { prisma } from '@/lib/db'

// Ключи Redis для счётчиков
const REDIS_KEYS = {
  SESSIONS_TODAY: 'chat:analytics:sessions:today',
  MESSAGES_TODAY: 'chat:analytics:messages:today',
  COMPLETED_TODAY: 'chat:analytics:completed:today',
  ABANDONED_TODAY: 'chat:analytics:abandoned:today',
  PROFILE_CLICKS_TODAY: 'chat:analytics:profile_clicks:today',
  CATALOG_CLICKS_TODAY: 'chat:analytics:catalog_clicks:today',
}

/**
 * События чата для трекинга
 */
export enum ChatEvent {
  SESSION_STARTED = 'session_started',
  MESSAGE_SENT = 'message_sent',
  RECOMMENDATIONS_SHOWN = 'recommendations_shown',
  PROFILE_CLICKED = 'profile_clicked',
  CATALOG_CLICKED = 'catalog_clicked',
  CHAT_COMPLETED = 'chat_completed',
  CHAT_ABANDONED = 'chat_abandoned',
}

/**
 * Трекинг события чата
 */
export async function trackChatEvent(
  event: ChatEvent,
  sessionId: string,
  metadata?: Record<string, any>
) {
  try {
    if (!redis) {
      console.warn('[Analytics] Redis not available, skipping tracking')
      return
    }

    const today = new Date().toISOString().split('T')[0]

    // Инкрементим счётчики в Redis (быстро)
    switch (event) {
      case ChatEvent.SESSION_STARTED:
        await redis.incr(`${REDIS_KEYS.SESSIONS_TODAY}:${today}`)
        await redis.expire(`${REDIS_KEYS.SESSIONS_TODAY}:${today}`, 60 * 60 * 48) // 48 часов
        break

      case ChatEvent.MESSAGE_SENT:
        await redis.incr(`${REDIS_KEYS.MESSAGES_TODAY}:${today}`)
        await redis.expire(`${REDIS_KEYS.MESSAGES_TODAY}:${today}`, 60 * 60 * 48)
        break

      case ChatEvent.CHAT_COMPLETED:
        await redis.incr(`${REDIS_KEYS.COMPLETED_TODAY}:${today}`)
        await redis.expire(`${REDIS_KEYS.COMPLETED_TODAY}:${today}`, 60 * 60 * 48)
        break

      case ChatEvent.CHAT_ABANDONED:
        await redis.incr(`${REDIS_KEYS.ABANDONED_TODAY}:${today}`)
        await redis.expire(`${REDIS_KEYS.ABANDONED_TODAY}:${today}`, 60 * 60 * 48)
        break

      case ChatEvent.PROFILE_CLICKED:
        await redis.incr(`${REDIS_KEYS.PROFILE_CLICKS_TODAY}:${today}`)
        await redis.expire(`${REDIS_KEYS.PROFILE_CLICKS_TODAY}:${today}`, 60 * 60 * 48)
        
        // Обновляем в сессии
        if (metadata?.specialistId) {
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: {
              clickedProfiles: {
                push: metadata.specialistId,
              },
            },
          })
        }
        break

      case ChatEvent.CATALOG_CLICKED:
        await redis.incr(`${REDIS_KEYS.CATALOG_CLICKS_TODAY}:${today}`)
        await redis.expire(`${REDIS_KEYS.CATALOG_CLICKS_TODAY}:${today}`, 60 * 60 * 48)
        break
    }

    console.log(`[Analytics] Tracked: ${event} for session ${sessionId}`)
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error)
    // Не бросаем ошибку — аналитика не должна ломать основной функционал
  }
}

/**
 * Получить статистику за сегодня (из Redis)
 */
export async function getTodayStats() {
  const today = new Date().toISOString().split('T')[0]

  try {
    if (!redis) {
      return null
    }

    const [
      sessionsStarted,
      messagesTotal,
      completedChats,
      abandonedChats,
      profileClicks,
      catalogClicks,
    ] = await Promise.all([
      redis.get(`${REDIS_KEYS.SESSIONS_TODAY}:${today}`),
      redis.get(`${REDIS_KEYS.MESSAGES_TODAY}:${today}`),
      redis.get(`${REDIS_KEYS.COMPLETED_TODAY}:${today}`),
      redis.get(`${REDIS_KEYS.ABANDONED_TODAY}:${today}`),
      redis.get(`${REDIS_KEYS.PROFILE_CLICKS_TODAY}:${today}`),
      redis.get(`${REDIS_KEYS.CATALOG_CLICKS_TODAY}:${today}`),
    ])

    const sessionsCount = parseInt(sessionsStarted || '0')
    const completedCount = parseInt(completedChats || '0')

    return {
      date: today,
      sessionsStarted: parseInt(sessionsStarted || '0'),
      messagesTotal: parseInt(messagesTotal || '0'),
      completedChats: completedCount,
      abandonedChats: parseInt(abandonedChats || '0'),
      profileClicks: parseInt(profileClicks || '0'),
      catalogClicks: parseInt(catalogClicks || '0'),
      conversionRate: sessionsCount > 0 ? (completedCount / sessionsCount) * 100 : 0,
    }
  } catch (error) {
    console.error('[Analytics] Error getting today stats:', error)
    return null
  }
}

/**
 * Агрегация данных из Redis в PostgreSQL (запускать раз в день)
 */
export async function aggregateDailyStats(date?: Date) {
  const targetDate = date || new Date()
  const dateStr = targetDate.toISOString().split('T')[0]

  try {
    const stats = await getTodayStats()

    if (!stats) {
      console.log('[Analytics] No stats to aggregate')
      return
    }

    // Получаем дополнительные метрики из БД
    const sessions = await prisma.chatSession.findMany({
      where: {
        createdAt: {
          gte: new Date(dateStr),
          lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: {
        messageCount: true,
        specialistsShown: true,
      },
    })

    const avgMessagesPerSession =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.messageCount, 0) / sessions.length
        : 0

    const avgSpecialistsShown =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.specialistsShown, 0) / sessions.length
        : 0

    // Сохраняем агрегированные данные
    await prisma.chatAnalytics.upsert({
      where: {
        date_hour: {
          date: new Date(dateStr),
          hour: null as any,
        },
      },
      create: {
        date: new Date(dateStr),
        hour: null as any,
        sessionsStarted: stats.sessionsStarted,
        messagesTotal: stats.messagesTotal,
        completedChats: stats.completedChats,
        abandonedChats: stats.abandonedChats,
        profileClicks: stats.profileClicks,
        catalogClicks: stats.catalogClicks,
        avgMessagesPerSession,
        avgSpecialistsShown,
      },
      update: {
        sessionsStarted: stats.sessionsStarted,
        messagesTotal: stats.messagesTotal,
        completedChats: stats.completedChats,
        abandonedChats: stats.abandonedChats,
        profileClicks: stats.profileClicks,
        catalogClicks: stats.catalogClicks,
        avgMessagesPerSession,
        avgSpecialistsShown,
      },
    })

    console.log(`[Analytics] Aggregated stats for ${dateStr}`)
  } catch (error) {
    console.error('[Analytics] Error aggregating daily stats:', error)
  }
}

/**
 * Очистка устаревших сессий (TTL истёк)
 */
export async function cleanupExpiredSessions() {
  try {
    const result = await prisma.chatSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    console.log(`[Analytics] Cleaned up ${result.count} expired sessions`)
    return result.count
  } catch (error) {
    console.error('[Analytics] Error cleaning up sessions:', error)
    return 0
  }
}

