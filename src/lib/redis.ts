import Redis from 'ioredis'

// Redis client для аналитики просмотров
// Работает с Railway Redis Plugin или любым стандартным Redis
const getRedisClient = () => {
  // В production используем REDIS_PUBLIC_URL для внешнего доступа
  // В development используем REDIS_URL для локального подключения
  const redisUrl = process.env.NODE_ENV === 'production' 
    ? process.env.REDIS_PUBLIC_URL
    : process.env.REDIS_URL

  if (!redisUrl) {
    console.warn('Redis URL not configured, analytics will be disabled')
    return null
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      // Добавляем обработку ошибок подключения
      connectTimeout: 10000,
    })

    // Обработка ошибок подключения
    client.on('error', (error) => {
      console.error('Redis connection error:', error)
    })

    client.on('connect', () => {
      console.log('Redis connected successfully')
    })

    return client
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
    // Увеличиваем в Redis для быстрого доступа
    await redis.incr(`profile:views:${specialistId}`)
    await redis.zadd('profile:views:leaderboard', Date.now(), specialistId)
    
    // Синхронизируем с БД (неблокирующий вызов)
    syncProfileViewsToDB(specialistId).catch((error) => {
      console.error('Failed to sync profile views to DB:', error)
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
export async function incrementContactView(
  specialistId: string,
  contactType: string
): Promise<boolean> {
  if (!redis) return false

  try {
    // Увеличиваем в Redis для быстрого доступа
    await redis.incr(`contact:views:${specialistId}`)
    await redis.incr(`contact:views:${specialistId}:${contactType}`)
    
    // Синхронизируем с БД (неблокирующий вызов)
    syncContactViewsToDB(specialistId).catch((error) => {
      console.error('Failed to sync contact views to DB:', error)
    })
    
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

// ========================================
// СИНХРОНИЗАЦИЯ С БД
// ========================================

/**
 * Синхронизировать просмотры профиля с БД
 */
async function syncProfileViewsToDB(specialistId: string): Promise<void> {
  try {
    const { prisma } = await import('@/lib/db')
    const redisViews = await getProfileViews(specialistId)
    
    await prisma.specialistProfile.update({
      where: { id: specialistId },
      data: { profileViews: redisViews }
    })
    
    console.log(`✅ Синхронизированы просмотры профиля для ${specialistId}: ${redisViews}`)
  } catch (error) {
    console.error(`❌ Ошибка синхронизации просмотров профиля для ${specialistId}:`, error)
  }
}

/**
 * Синхронизировать просмотры контактов с БД
 */
async function syncContactViewsToDB(specialistId: string): Promise<void> {
  try {
    const { prisma } = await import('@/lib/db')
    const redisViews = await getContactViews(specialistId)
    
    await prisma.specialistProfile.update({
      where: { id: specialistId },
      data: { contactViews: redisViews }
    })
    
    console.log(`✅ Синхронизированы просмотры контактов для ${specialistId}: ${redisViews}`)
  } catch (error) {
    console.error(`❌ Ошибка синхронизации просмотров контактов для ${specialistId}:`, error)
  }
}
