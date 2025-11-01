/**
 * API для получения аналитики специалиста
 * GET /api/specialist/analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import {
  getMetrics,
  getTrends,
  getFunnel,
  getSources,
  getPeriodInfo,
  type AnalyticsPeriod
} from '@/lib/analytics/specialist-analytics-service'

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authSession = await getAuthSession(request)
    
    if (!authSession) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    if (!authSession.specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Профиль специалиста не найден' },
        { status: 404 }
      )
    }

    const specialistId = authSession.specialistProfile.id

    // Получаем период из query параметров
    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get('period') || 'month'
    
    // Валидация периода
    const validPeriods: AnalyticsPeriod[] = ['day', 'week', 'month', 'quarter', 'year', 'all']
    const period = validPeriods.includes(periodParam as AnalyticsPeriod)
      ? (periodParam as AnalyticsPeriod)
      : 'month'

    // Получаем информацию о периоде
    const periodInfo = getPeriodInfo(period)

    // Получаем все данные параллельно
    const [metrics, trends, funnel, sources] = await Promise.all([
      getMetrics(specialistId, period),
      getTrends(specialistId, period),
      getFunnel(specialistId, period),
      getSources(specialistId, period)
    ])

    return NextResponse.json({
      success: true,
      period: {
        start: periodInfo.start.toISOString().split('T')[0],
        end: periodInfo.end.toISOString().split('T')[0],
        label: periodInfo.label
      },
      metrics,
      funnel,
      sources,
      trends
    })

  } catch (error) {
    console.error('Ошибка при получении аналитики:', error)
    
    // Детальное логирование для отладки
    if (error instanceof Error) {
      console.error('Ошибка типа:', error.constructor.name)
      console.error('Сообщение:', error.message)
      console.error('Стек:', error.stack)
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        // В dev режиме показываем детали ошибки
        ...(process.env.NODE_ENV === 'development' && error instanceof Error ? {
          details: error.message,
          stack: error.stack
        } : {})
      },
      { status: 500 }
    )
  }
}

