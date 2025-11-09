/**
 * Сервис аналитики для специалистов
 * Агрегирует данные из PostgreSQL и Redis
 */

import { prisma } from '@/lib/db'
import { getProfileViewsBySource, getContactViewsBySource } from '@/lib/redis'

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all'

export interface MetricsData {
  profileViews: { total: number; change: number }
  contactViews: { total: number; change: number }
  consultationRequests: { total: number; change: number }
  orders: { total: number; change: number }
}

export interface TrendDataPoint {
  date: string
  value: number
}

export interface TrendData {
  profileViews: TrendDataPoint[]
  contactViews: TrendDataPoint[]
}

export interface FunnelData {
  profileViews: number
  contactViews: number
  consultationRequests: number
  orders: number
  conversionRates: {
    profileToContact: number
    contactToRequest: number
    requestToOrder: number
  }
}

export interface SourceData {
  catalog: { count: number; percentage: number }
  search: { count: number; percentage: number }
  direct: { count: number; percentage: number }
}

export interface PeriodInfo {
  start: Date
  end: Date
  label: string
}

// ========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

/**
 * Нормализовать дату: начало дня (00:00:00)
 */
function getStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Нормализовать дату: конец дня (23:59:59)
 */
function getEndOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Получить сегодняшние данные из Redis
 * Возвращает { profileViews, contactViews, profileViewsBySource }
 */
async function getTodayDataFromRedis(
  specialistId: string,
  date: Date = new Date()
): Promise<{
  profileViews: number
  contactViews: number
  profileViewsBySource: Record<string, number>
}> {
  const todayStr = date.toISOString().split('T')[0]
  
  const [profileViewsBySource, contactViewsBySource] = await Promise.all([
    getProfileViewsBySource(specialistId, todayStr),
    getContactViewsBySource(specialistId, todayStr)
  ])
  
  return {
    profileViews: Object.values(profileViewsBySource).reduce((sum, val) => sum + val, 0),
    contactViews: Object.values(contactViewsBySource).reduce((sum, val) => sum + val, 0),
    profileViewsBySource
  }
}

/**
 * Вычислить процент конверсии
 */
function calculateConversionRate(from: number, to: number): number {
  if (from === 0) return 0
  return Math.round((to / from) * 100 * 10) / 10 // Округляем до 1 знака после запятой
}

/**
 * Проверить, есть ли агрегированные данные за дату в БД
 */
async function hasAggregatedData(
  specialistId: string,
  date: Date
): Promise<boolean> {
  const dateOnly = getStartOfDay(date)
  
  try {
    const count = await prisma.specialistAnalyticsDaily.count({
      where: {
        specialistId,
        date: dateOnly
      }
    })
    
    return count > 0
  } catch (error: unknown) {
    // Обрабатываем ошибки подключения к БД
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2037') {
      // Too many database connections - возвращаем false, чтобы не создавать новые запросы
      console.error('[Analytics] Too many database connections. Assuming no aggregated data.')
      return false
    }
    
    // Таблица может не существовать, если миграция не применена
    console.warn('[Analytics] Table SpecialistAnalyticsDaily may not exist yet:', error)
    return false
  }
}

/**
 * Ленивая агрегация: автоматически агрегирует данные за день, если их еще нет
 * Работает в фоне (неблокирующий вызов)
 */
async function lazyAggregateIfNeeded(
  specialistId: string,
  date: Date
): Promise<void> {
  // Агрегируем только за вчера и более старые дни (не сегодня)
  const today = getStartOfDay(new Date())
  const targetDate = getStartOfDay(date)
  
  // Пропускаем агрегацию для сегодня (данные берутся из Redis)
  if (targetDate >= today) {
    return
  }
  
  // Проверяем, есть ли уже данные
  const hasData = await hasAggregatedData(specialistId, targetDate)
  if (hasData) {
    return
  }
  
  // Агрегируем в фоне (не блокируем основной запрос)
  aggregateDailyData(specialistId, targetDate).catch((error) => {
    console.error(`[Lazy Aggregation] Ошибка агрегации для специалиста ${specialistId}, дата ${targetDate.toISOString()}:`, error)
  })
}

// Глобальный Set для отслеживания текущих агрегаций (дедупликация)
const ongoingAggregations = new Set<string>()

/**
 * Агрегировать данные за период (если нужно)
 * Проверяет каждый день периода и агрегирует недостающие данные
 * Обрабатывает дни батчами для предотвращения перегрузки БД
 */
async function ensurePeriodAggregated(
  specialistId: string,
  startDate: Date,
  endDate: Date
): Promise<void> {
  const today = getStartOfDay(new Date())
  const start = getStartOfDay(startDate)
  const end = getStartOfDay(endDate)
  
  // Создаем массив дат в периоде
  const dates: Date[] = []
  const currentDate = new Date(start)
  
  while (currentDate <= end && currentDate < today) {
    // Агрегируем только за прошлые дни (не сегодня)
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Ограничиваем параллелизм: обрабатываем батчами по 10 дней за раз
  // Это предотвращает создание слишком большого количества соединений с БД
  const BATCH_SIZE = 10
  
  for (let i = 0; i < dates.length; i += BATCH_SIZE) {
    const batch = dates.slice(i, i + BATCH_SIZE)
    
    // Обрабатываем батч параллельно
    await Promise.allSettled(
      batch.map(date => {
        const dateKey = `${specialistId}:${date.toISOString().split('T')[0]}`
        
        // Дедупликация: пропускаем, если агрегация уже идет
        if (ongoingAggregations.has(dateKey)) {
          return Promise.resolve()
        }
        
        ongoingAggregations.add(dateKey)
        
        return lazyAggregateIfNeeded(specialistId, date).finally(() => {
          ongoingAggregations.delete(dateKey)
        })
      })
    )
    
    // Небольшая задержка между батчами для снижения нагрузки на БД
    if (i + BATCH_SIZE < dates.length) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
}

// ========================================
// ОСНОВНЫЕ ФУНКЦИИ
// ========================================

/**
 * Получить информацию о периоде
 */
export function getPeriodInfo(period: AnalyticsPeriod): PeriodInfo {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let start: Date
  let label: string

  switch (period) {
    case 'day':
      start = new Date(end)
      label = 'Сегодня'
      break
    case 'week':
      start = new Date(end)
      start.setDate(start.getDate() - 7)
      label = 'Последние 7 дней'
      break
    case 'month':
      start = new Date(end)
      start.setMonth(start.getMonth() - 1)
      label = 'Последний месяц'
      break
    case 'quarter':
      start = new Date(end)
      start.setMonth(start.getMonth() - 3)
      label = 'Последние 3 месяца'
      break
    case 'year':
      start = new Date(end)
      start.setFullYear(start.getFullYear() - 1)
      label = 'Последний год'
      break
    case 'all':
      start = new Date(2020, 0, 1) // Начало эпохи
      label = 'Все время'
      break
    default:
      start = new Date(end)
      start.setMonth(start.getMonth() - 1)
      label = 'Последний месяц'
  }

  return { start, end, label }
}

/**
 * Получить метрики за период с сравнением с предыдущим периодом
 */
export async function getMetrics(
  specialistId: string,
  period: AnalyticsPeriod
): Promise<MetricsData> {
  const periodInfo = getPeriodInfo(period)
  
  // Вычисляем предыдущий период для сравнения
  const prevPeriodDuration = periodInfo.end.getTime() - periodInfo.start.getTime()
  const prevPeriodEnd = new Date(periodInfo.start.getTime() - 1)
  const prevPeriodStart = new Date(prevPeriodEnd.getTime() - prevPeriodDuration)

  // Получаем данные за текущий период
  const [currentData, previousData] = await Promise.all([
    getMetricsForPeriod(specialistId, periodInfo.start, periodInfo.end),
    getMetricsForPeriod(specialistId, prevPeriodStart, prevPeriodEnd)
  ])

  // Вычисляем изменения в процентах
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  return {
    profileViews: {
      total: currentData.profileViews,
      change: calculateChange(currentData.profileViews, previousData.profileViews)
    },
    contactViews: {
      total: currentData.contactViews,
      change: calculateChange(currentData.contactViews, previousData.contactViews)
    },
    consultationRequests: {
      total: currentData.consultationRequests,
      change: calculateChange(currentData.consultationRequests, previousData.consultationRequests)
    },
    orders: {
      total: currentData.orders,
      change: calculateChange(currentData.orders, previousData.orders)
    }
  }
}

/**
 * Получить метрики за конкретный период
 */
async function getMetricsForPeriod(
  specialistId: string,
  start: Date,
  end: Date
): Promise<{
  profileViews: number
  contactViews: number
  consultationRequests: number
  orders: number
}> {
  const startDate = getStartOfDay(start)
  const endDate = getEndOfDay(end)

  // Обеспечиваем агрегацию данных за период (ленивая агрегация)
  // Это работает в фоне и не блокирует запрос
  ensurePeriodAggregated(specialistId, startDate, endDate).catch((error) => {
    console.error('[Lazy Aggregation] Ошибка при агрегации периода:', error)
  })

  // Получаем агрегированные данные из SpecialistAnalyticsDaily
  // Обрабатываем случай, когда таблица еще не создана
  let dailyData: Array<{ profileViews: number; contactViews: number; date: Date }> = []
  try {
    dailyData = await prisma.specialistAnalyticsDaily.findMany({
      where: {
        specialistId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })
  } catch (error) {
    // Таблица может не существовать, если миграция не применена
    console.warn('[Analytics] Table SpecialistAnalyticsDaily may not exist yet:', error)
    dailyData = []
  }

  // Если сегодня входит в период, добавляем данные из Redis
  const today = getStartOfDay(new Date())
  let todayProfileViews = 0
  let todayContactViews = 0

  if (today >= startDate && today <= endDate) {
    const todayData = await getTodayDataFromRedis(specialistId)
    todayProfileViews = todayData.profileViews
    todayContactViews = todayData.contactViews
  }

  // Суммируем данные из БД
  const profileViews = dailyData.reduce((sum, day) => sum + day.profileViews, 0) + todayProfileViews
  const contactViews = dailyData.reduce((sum, day) => sum + day.contactViews, 0) + todayContactViews

  // Получаем заявки и заказы из основных таблиц (для точности)
  const [consultationRequests, orders] = await Promise.all([
    prisma.consultationRequest.count({
      where: {
        specialistProfileId: specialistId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    prisma.order.count({
      where: {
        specialistProfileId: specialistId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })
  ])

  return {
    profileViews,
    contactViews,
    consultationRequests,
    orders
  }
}

/**
 * Получить тренды (данные для графика)
 */
export async function getTrends(
  specialistId: string,
  period: AnalyticsPeriod
): Promise<TrendData> {
  const periodInfo = getPeriodInfo(period)
  const startDate = getStartOfDay(periodInfo.start)
  const endDate = getEndOfDay(periodInfo.end)

  // Обеспечиваем агрегацию данных за период (ленивая агрегация)
  ensurePeriodAggregated(specialistId, startDate, endDate).catch((error) => {
    console.error('[Lazy Aggregation] Ошибка при агрегации периода:', error)
  })

  // Получаем ежедневные данные
  // Обрабатываем случай, когда таблица еще не создана
  let dailyData: Array<{ profileViews: number; contactViews: number; date: Date }> = []
  try {
    dailyData = await prisma.specialistAnalyticsDaily.findMany({
      where: {
        specialistId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    })
  } catch (error) {
    // Таблица может не существовать, если миграция не применена
    console.warn('[Analytics] Table SpecialistAnalyticsDaily may not exist yet:', error)
    dailyData = []
  }

  // Создаем массив дат в периоде
  const dates: Date[] = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Маппим данные из БД
  const dataMap = new Map<string, { profileViews: number; contactViews: number }>()
  dailyData.forEach(day => {
    const dateStr = day.date.toISOString().split('T')[0]
    dataMap.set(dateStr, {
      profileViews: day.profileViews,
      contactViews: day.contactViews
    })
  })

  // Добавляем данные за сегодня из Redis, если сегодня входит в период
  const today = getStartOfDay(new Date())
  const todayStr = today.toISOString().split('T')[0]

  if (today >= startDate && today <= endDate) {
    const todayData = await getTodayDataFromRedis(specialistId)
    dataMap.set(todayStr, {
      profileViews: todayData.profileViews,
      contactViews: todayData.contactViews
    })
  }

  // Формируем массивы точек данных
  const profileViewsTrend: TrendDataPoint[] = dates.map(date => {
    const dateStr = date.toISOString().split('T')[0]
    const data = dataMap.get(dateStr)
    return {
      date: dateStr,
      value: data?.profileViews || 0
    }
  })

  const contactViewsTrend: TrendDataPoint[] = dates.map(date => {
    const dateStr = date.toISOString().split('T')[0]
    const data = dataMap.get(dateStr)
    return {
      date: dateStr,
      value: data?.contactViews || 0
    }
  })

  return {
    profileViews: profileViewsTrend,
    contactViews: contactViewsTrend
  }
}

/**
 * Получить воронку конверсий
 */
export async function getFunnel(
  specialistId: string,
  period: AnalyticsPeriod
): Promise<FunnelData> {
  const metrics = await getMetrics(specialistId, period)
  const funnelData = {
    profileViews: metrics.profileViews.total,
    contactViews: metrics.contactViews.total,
    consultationRequests: metrics.consultationRequests.total,
    orders: metrics.orders.total
  }

  return {
    ...funnelData,
    conversionRates: {
      profileToContact: calculateConversionRate(funnelData.profileViews, funnelData.contactViews),
      contactToRequest: calculateConversionRate(funnelData.contactViews, funnelData.consultationRequests),
      requestToOrder: calculateConversionRate(funnelData.consultationRequests, funnelData.orders)
    }
  }
}

/**
 * Получить источники трафика
 */
export async function getSources(
  specialistId: string,
  period: AnalyticsPeriod
): Promise<SourceData> {
  const periodInfo = getPeriodInfo(period)
  const startDate = getStartOfDay(periodInfo.start)
  const endDate = getEndOfDay(periodInfo.end)

  // Обеспечиваем агрегацию данных за период (ленивая агрегация)
  ensurePeriodAggregated(specialistId, startDate, endDate).catch((error) => {
    console.error('[Lazy Aggregation] Ошибка при агрегации периода:', error)
  })

  // Получаем данные из SpecialistAnalyticsDaily
  // Обрабатываем случай, когда таблица еще не создана
  let dailyData: Array<{ sources: unknown }> = []
  try {
    dailyData = await prisma.specialistAnalyticsDaily.findMany({
      where: {
        specialistId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })
  } catch (error) {
    // Таблица может не существовать, если миграция не применена
    console.warn('[Analytics] Table SpecialistAnalyticsDaily may not exist yet:', error)
    dailyData = []
  }

  // Суммируем источники из всех дней
  const sourcesCount: Record<string, number> = { catalog: 0, search: 0, direct: 0 }

  dailyData.forEach(day => {
    if (day.sources && typeof day.sources === 'object') {
      const sources = day.sources as Record<string, number>
      sourcesCount.catalog += sources.catalog || 0
      sourcesCount.search += sources.search || 0
      sourcesCount.direct += sources.direct || 0
    }
  })

  // Добавляем данные за сегодня из Redis
  const today = getStartOfDay(new Date())

  if (today >= startDate && today <= endDate) {
    const todayData = await getTodayDataFromRedis(specialistId)
    sourcesCount.catalog += todayData.profileViewsBySource.catalog
    sourcesCount.search += todayData.profileViewsBySource.search
    sourcesCount.direct += todayData.profileViewsBySource.direct
  }

  const total = sourcesCount.catalog + sourcesCount.search + sourcesCount.direct

  // Вычисляем проценты
  const calculatePercentage = (count: number): number => {
    if (total === 0) return 0
    return Math.round((count / total) * 100)
  }

  return {
    catalog: {
      count: sourcesCount.catalog,
      percentage: calculatePercentage(sourcesCount.catalog)
    },
    search: {
      count: sourcesCount.search,
      percentage: calculatePercentage(sourcesCount.search)
    },
    direct: {
      count: sourcesCount.direct,
      percentage: calculatePercentage(sourcesCount.direct)
    }
  }
}

/**
 * Агрегация ежедневных данных из Redis в PostgreSQL
 */
export async function aggregateDailyData(
  specialistId: string,
  date: Date
): Promise<void> {
  const dateOnly = getStartOfDay(date)

  // Получаем данные из Redis за этот день
  const todayData = await getTodayDataFromRedis(specialistId, date)
  const profileViews = todayData.profileViews
  const contactViews = todayData.contactViews

  // Получаем заявки, заказы и отзывы за этот день параллельно
  const startOfDay = getStartOfDay(dateOnly)
  const endOfDay = getEndOfDay(dateOnly)

  const [consultationRequests, orders, reviews] = await Promise.all([
    prisma.consultationRequest.count({
      where: {
        specialistProfileId: specialistId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    }),
    prisma.order.count({
      where: {
        specialistProfileId: specialistId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    }),
    prisma.review.count({
      where: {
        specialistId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })
  ])

  // Вычисляем конверсии
  const conversionProfileToContact = calculateConversionRate(profileViews, contactViews)
  const conversionContactToRequest = calculateConversionRate(contactViews, consultationRequests)
  const conversionRequestToOrder = calculateConversionRate(consultationRequests, orders)

  // Сохраняем или обновляем запись в БД
  // Обрабатываем случай, когда таблица еще не создана
  try {
    await prisma.specialistAnalyticsDaily.upsert({
    where: {
      specialistId_date: {
        specialistId,
        date: dateOnly
      }
    },
    create: {
      specialistId,
      date: dateOnly,
      profileViews,
      contactViews,
      consultationRequests,
      orders,
      reviews,
      sources: {
        catalog: todayData.profileViewsBySource.catalog,
        search: todayData.profileViewsBySource.search,
        direct: todayData.profileViewsBySource.direct
      },
      conversionRateProfileToContact: conversionProfileToContact,
      conversionRateContactToRequest: conversionContactToRequest,
      conversionRateRequestToOrder: conversionRequestToOrder
    },
    update: {
      profileViews,
      contactViews,
      consultationRequests,
      orders,
      reviews,
      sources: {
        catalog: todayData.profileViewsBySource.catalog,
        search: todayData.profileViewsBySource.search,
        direct: todayData.profileViewsBySource.direct
      },
      conversionRateProfileToContact: conversionProfileToContact,
      conversionRateContactToRequest: conversionContactToRequest,
      conversionRateRequestToOrder: conversionRequestToOrder
    }
    })
  } catch (error: unknown) {
    // Обрабатываем ошибки подключения к БД
    if (error && typeof error === 'object' && 'code' in error) {
      // P2037 = Too many database connections
      if (error.code === 'P2037') {
        console.error('[Analytics] Too many database connections. Skipping aggregation for', specialistId, dateOnly.toISOString())
        // Не пробрасываем ошибку - агрегация может произойти позже
        return
      }
      // P2025 = Record not found (не критично для upsert)
      if (error.code === 'P2025') {
        console.warn('[Analytics] Record not found during upsert:', error)
        return
      }
    }
    
    // Таблица может не существовать, если миграция не применена
    console.warn('[Analytics] Table SpecialistAnalyticsDaily may not exist yet or error:', error)
    // Не пробрасываем ошибку дальше - агрегация может произойти позже
  }
}

