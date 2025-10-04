import Redis from 'ioredis'

// Redis client для аналитики просмотров
// Работает с Railway Redis Plugin или любым стандартным Redis
const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    console.warn('REDIS_URL not configured, analytics will be disabled')
    return null
  }

  try {
    return new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    })
  } catch (error) {
    console.error('Failed to create Redis client:', error)
    return null
  }
}

export const redis = getRedisClient()

// Вспомогательные функции для аналитики

/**
 * Увеличить счетчик просмотров профиля специалиста
 */
export async function incrementProfileView(specialistId: string): Promise<boolean> {
  if (!redis) return false

  try {
    await redis.incr(`profile:views:${specialistId}`)
    await redis.zadd('profile:views:leaderboard', Date.now(), specialistId)
    return true
  } catch (error) {
    console.error('Redis error (incrementProfileView):', error)
    return false
  }
}

/**
 * Увеличить счетчик просмотров контактов специалиста
 */
export async function incrementContactView(
  specialistId: string,
  contactType: string
): Promise<boolean> {
  if (!redis) return false

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
  if (!redis) return 0

  try {
    const views = await redis.get(`profile:views:${specialistId}`)
    return views ? parseInt(views, 10) : 0
  } catch (error) {
    console.error('Redis error (getProfileViews):', error)
    return 0
  }
}

/**
 * Получить количество просмотров контактов
 */
export async function getContactViews(specialistId: string): Promise<number> {
  if (!redis) return 0

  try {
    const views = await redis.get(`contact:views:${specialistId}`)
    return views ? parseInt(views, 10) : 0
  } catch (error) {
    console.error('Redis error (getContactViews):', error)
    return 0
  }
}
