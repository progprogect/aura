/**
 * API для получения метрик конверсии
 * Возвращает данные о конверсии в клики профилей
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTodayStats, aggregateDailyStats } from '@/lib/analytics/chat-analytics'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today'
    const includeDetails = searchParams.get('details') === 'true'

    let stats: any = null

    if (period === 'today') {
      // Получаем статистику за сегодня
      stats = await getTodayStats()
    } else if (period === 'week') {
      // Получаем статистику за неделю
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const weekStats = await prisma.chatAnalytics.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'desc',
        },
      })

      // Агрегируем данные за неделю
      stats = {
        period: 'week',
        sessionsStarted: weekStats.reduce((sum, s) => sum + s.sessionsStarted, 0),
        messagesTotal: weekStats.reduce((sum, s) => sum + s.messagesTotal, 0),
        completedChats: weekStats.reduce((sum, s) => sum + s.completedChats, 0),
        abandonedChats: weekStats.reduce((sum, s) => sum + s.abandonedChats, 0),
        profileClicks: weekStats.reduce((sum, s) => sum + s.profileClicks, 0),
        catalogClicks: weekStats.reduce((sum, s) => sum + s.catalogClicks, 0),
        avgMessagesPerSession: weekStats.length > 0 
          ? weekStats.reduce((sum, s) => sum + s.avgMessagesPerSession, 0) / weekStats.length 
          : 0,
        avgSpecialistsShown: weekStats.length > 0 
          ? weekStats.reduce((sum, s) => sum + s.avgSpecialistsShown, 0) / weekStats.length 
          : 0,
      }

      // Вычисляем конверсию
      stats.conversionRate = stats.sessionsStarted > 0 
        ? (stats.profileClicks / stats.sessionsStarted) * 100 
        : 0

    } else if (period === 'month') {
      // Получаем статистику за месяц
      const endDate = new Date()
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
      
      const monthStats = await prisma.chatAnalytics.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'desc',
        },
      })

      // Агрегируем данные за месяц
      stats = {
        period: 'month',
        sessionsStarted: monthStats.reduce((sum, s) => sum + s.sessionsStarted, 0),
        messagesTotal: monthStats.reduce((sum, s) => sum + s.messagesTotal, 0),
        completedChats: monthStats.reduce((sum, s) => sum + s.completedChats, 0),
        abandonedChats: monthStats.reduce((sum, s) => sum + s.abandonedChats, 0),
        profileClicks: monthStats.reduce((sum, s) => sum + s.profileClicks, 0),
        catalogClicks: monthStats.reduce((sum, s) => sum + s.catalogClicks, 0),
        avgMessagesPerSession: monthStats.length > 0 
          ? monthStats.reduce((sum, s) => sum + s.avgMessagesPerSession, 0) / monthStats.length 
          : 0,
        avgSpecialistsShown: monthStats.length > 0 
          ? monthStats.reduce((sum, s) => sum + s.avgSpecialistsShown, 0) / monthStats.length 
          : 0,
      }

      // Вычисляем конверсию
      stats.conversionRate = stats.sessionsStarted > 0 
        ? (stats.profileClicks / stats.sessionsStarted) * 100 
        : 0
    }

    if (!stats) {
      return NextResponse.json({ error: 'No stats available' }, { status: 404 })
    }

    // Дополнительные детали если запрошены
    if (includeDetails) {
      // Получаем детали по сессиям
      const sessions = await prisma.chatSession.findMany({
        where: {
          createdAt: {
            gte: period === 'today' ? new Date(new Date().setHours(0, 0, 0, 0)) :
                 period === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) :
                 new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        select: {
          id: true,
          messageCount: true,
          specialistsShown: true,
          clickedProfiles: true,
          extractedFilters: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100, // Последние 100 сессий
      })

      // Анализируем качество персонализации
      const personalizationAnalysis = analyzePersonalizationQuality(sessions)

      stats.details = {
        recentSessions: sessions.slice(0, 10),
        personalizationAnalysis,
        topClickedSpecialists: getTopClickedSpecialists(sessions),
        conversionByCategory: getConversionByCategory(sessions),
      }
    }

    // Вычисляем дополнительные метрики
    stats.clickThroughRate = stats.sessionsStarted > 0 
      ? (stats.profileClicks / stats.sessionsStarted) * 100 
      : 0

    stats.completionRate = stats.sessionsStarted > 0 
      ? (stats.completedChats / stats.sessionsStarted) * 100 
      : 0

    stats.abandonmentRate = stats.sessionsStarted > 0 
      ? (stats.abandonedChats / stats.sessionsStarted) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[Analytics API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Анализирует качество персонализации
 */
function analyzePersonalizationQuality(sessions: any[]) {
  const totalSessions = sessions.length
  const sessionsWithPersonalData = sessions.filter(s => 
    s.extractedFilters && 
    typeof s.extractedFilters === 'object' && 
    s.extractedFilters.personalProfile
  ).length

  const sessionsWithClicks = sessions.filter(s => 
    s.clickedProfiles && s.clickedProfiles.length > 0
  ).length

  const avgMessagesPerSession = totalSessions > 0 
    ? sessions.reduce((sum, s) => sum + s.messageCount, 0) / totalSessions 
    : 0

  const avgSpecialistsShown = totalSessions > 0 
    ? sessions.reduce((sum, s) => sum + s.specialistsShown, 0) / totalSessions 
    : 0

  return {
    totalSessions,
    sessionsWithPersonalData,
    sessionsWithClicks,
    personalizationRate: totalSessions > 0 ? (sessionsWithPersonalData / totalSessions) * 100 : 0,
    clickRate: totalSessions > 0 ? (sessionsWithClicks / totalSessions) * 100 : 0,
    avgMessagesPerSession: Math.round(avgMessagesPerSession * 100) / 100,
    avgSpecialistsShown: Math.round(avgSpecialistsShown * 100) / 100,
  }
}

/**
 * Получает топ кликнутых специалистов
 */
function getTopClickedSpecialists(sessions: any[]) {
  const specialistClicks: Record<string, number> = {}
  
  sessions.forEach(session => {
    if (session.clickedProfiles && Array.isArray(session.clickedProfiles)) {
      session.clickedProfiles.forEach((specialistId: string) => {
        specialistClicks[specialistId] = (specialistClicks[specialistId] || 0) + 1
      })
    }
  })

  return Object.entries(specialistClicks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([specialistId, clicks]) => ({ specialistId, clicks }))
}

/**
 * Получает конверсию по категориям
 */
function getConversionByCategory(sessions: any[]) {
  const categoryStats: Record<string, { sessions: number, clicks: number }> = {}
  
  sessions.forEach(session => {
    if (session.extractedFilters && session.extractedFilters.category) {
      const category = session.extractedFilters.category
      if (!categoryStats[category]) {
        categoryStats[category] = { sessions: 0, clicks: 0 }
      }
      categoryStats[category].sessions++
      
      if (session.clickedProfiles && session.clickedProfiles.length > 0) {
        categoryStats[category].clicks++
      }
    }
  })

  return Object.entries(categoryStats).map(([category, stats]) => ({
    category,
    sessions: stats.sessions,
    clicks: stats.clicks,
    conversionRate: stats.sessions > 0 ? (stats.clicks / stats.sessions) * 100 : 0,
  })).sort((a, b) => b.conversionRate - a.conversionRate)
}
