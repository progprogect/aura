/**
 * Cron endpoint для ежедневной агрегации аналитики (ОПЦИОНАЛЬНО)
 * POST /api/cron/aggregate-analytics
 * 
 * ⚠️ ВАЖНО: Этот endpoint НЕ обязателен!
 * Система использует ленивую агрегацию (lazy aggregation):
 * - Данные автоматически агрегируются при первом запросе аналитики
 * - Работает в фоне, не блокирует основной запрос
 * - Не требует внешних зависимостей (cron jobs)
 * 
 * Этот endpoint можно использовать для:
 * - Массовой агрегации исторических данных (backfill)
 * - Предварительной агрегации всех специалистов за вчера
 * - Оптимизации производительности при большом количестве специалистов
 * 
 * Защищен секретным ключом из переменных окружения
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { aggregateDailyData } from '@/lib/analytics/specialist-analytics-service'

export async function POST(request: NextRequest) {
  try {
    // Проверка секретного ключа для безопасности
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.RAILWAY_CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Получаем вчерашний день (по UTC)
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(0, 0, 0, 0)

    // Получаем всех специалистов
    const specialists = await prisma.specialistProfile.findMany({
      select: {
        id: true
      }
    })

    console.log(`[Cron] Начинаем агрегацию аналитики за ${yesterday.toISOString().split('T')[0]} для ${specialists.length} специалистов`)

    let successCount = 0
    let errorCount = 0

    // Агрегируем данные для каждого специалиста
    for (const specialist of specialists) {
      try {
        await aggregateDailyData(specialist.id, yesterday)
        successCount++
      } catch (error) {
        console.error(`[Cron] Ошибка агрегации для специалиста ${specialist.id}:`, error)
        errorCount++
      }
    }

    console.log(`[Cron] Агрегация завершена: ${successCount} успешно, ${errorCount} ошибок`)

    return NextResponse.json({
      success: true,
      date: yesterday.toISOString().split('T')[0],
      processed: successCount,
      errors: errorCount,
      total: specialists.length
    })

  } catch (error) {
    console.error('[Cron] Ошибка агрегации аналитики:', error)

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

