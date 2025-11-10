/**
 * Контент главной страницы админ-панели
 */

'use client'

import { useState, useEffect } from 'react'
import { AdminStatsCards } from './AdminStatsCards'
import { AdminStatsCharts } from './AdminStatsCharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'

type StatsPeriod = 'day' | 'week' | 'month' | 'all'

interface AdminStats {
  users: {
    total: number
    blocked: number
    active: number
    new: number
  }
  specialists: {
    total: number
    verified: number
    blocked: number
    active: number
    new: number
    byCategory: Array<{ category: string; count: number }>
  }
  orders: {
    total: number
    active: number
    completed: number
    cancelled: number
    new: number
    conversionRate: number
  }
  points: {
    totalBalance: number
    totalBonusBalance: number
    granted: number
    spent: number
  }
  activity: {
    profileViews: number
    contactViews: number
    consultationRequests: number
    totalReviews: number
    newReviews: number
  }
  charts: {
    registrationsByDay: Array<{ date: string; count: number }>
    ordersByDay: Array<{ date: string; count: number }>
  }
  period: {
    type: string
    start: string | null
  }
}

export function AdminDashboardContent() {
  const [period, setPeriod] = useState<StatsPeriod>('all')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/stats?period=${period}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка загрузки статистики')
      }

      setStats(data.stats)
    } catch (err: any) {
      console.error('Ошибка загрузки статистики:', err)
      setError(err.message || 'Ошибка загрузки статистики')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [period])

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">{error}</div>
          <Button onClick={fetchStats} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтр периода */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Статистика</h1>
          <p className="text-sm text-gray-600 mt-1">
            Обзор активности платформы
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as StatsPeriod)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="day">За день</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="all">Все время</option>
          </select>
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Карточки статистики */}
      <AdminStatsCards stats={stats} />

      {/* Графики */}
      <AdminStatsCharts stats={stats} />
    </div>
  )
}

