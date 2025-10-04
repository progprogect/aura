import { Redis } from '@upstash/redis'

// Redis client для аналитики просмотров
export const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
})

// Вспомогательные функции для аналитики

/**
 * Увеличить счетчик просмотров профиля специалиста
 */
export async function incrementProfileView(specialistId: string) {
  try {
    await redis.incr(`profile:views:${specialistId}`)
    await redis.zadd('profile:views:leaderboard', {
      score: Date.now(),
      member: specialistId,
    })
    return true
  } catch (error) {
    console.error('Redis error (incrementProfileView):', error)
    return false
  }
}

/**
 * Увеличить счетчик просмотров контактов специалиста
 */
export async function incrementContactView(specialistId: string, contactType: string) {
  try {
    await redis.incr(`contact:views:${specialistId}`)
    await redis.incr(`contact:views:${specialistId}:${contactType}`)
    return true
  } catch (error) {
    console.error('Redis error (incrementContactView):', error)
    return false
  }
}

/**
 * Получить количество просмотров профиля
 */
export async function getProfileViews(specialistId: string): Promise<number> {
  try {
    const views = await redis.get<number>(`profile:views:${specialistId}`)
    return views || 0
  } catch (error) {
    console.error('Redis error (getProfileViews):', error)
    return 0
  }
}

/**
 * Получить количество просмотров контактов
 */
export async function getContactViews(specialistId: string): Promise<number> {
  try {
    const views = await redis.get<number>(`contact:views:${specialistId}`)
    return views || 0
  } catch (error) {
    console.error('Redis error (getContactViews):', error)
    return 0
  }
}

