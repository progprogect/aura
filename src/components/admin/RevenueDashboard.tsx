/**
 * Основной компонент дашборда комиссий
 */

'use client'

import { useState, useEffect } from 'react'
import { RevenueStats } from './RevenueStats'
import { RevenueTransactions } from './RevenueTransactions'
import { Loader2 } from 'lucide-react'

type StatsPeriod = 'day' | 'week' | 'month' | 'year' | 'all'

interface RevenueOverview {
  totalCommission: number
  totalCashback: number
  totalNetRevenue: number
  totalTransactions: number
  byType: {
    leadMagnet: {
      commission: number
      cashback: number
      netRevenue: number
      count: number
    }
    service: {
      commission: number
      cashback: number
      netRevenue: number
      count: number
    }
  }
  byPeriod: {
    day: { commission: number; cashback: number; netRevenue: number; count: number }
    week: { commission: number; cashback: number; netRevenue: number; count: number }
    month: { commission: number; cashback: number; netRevenue: number; count: number }
    year: { commission: number; cashback: number; netRevenue: number; count: number }
  }
  period: {
    type: string
    start: string | null
  }
}

export function RevenueDashboard() {
  const [period, setPeriod] = useState<StatsPeriod>('all')
  const [stats, setStats] = useState<RevenueOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/revenue/overview?period=${period}`)
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

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтр периода */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Комиссии и кешбэк</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as StatsPeriod)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="day">День</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
          <option value="year">Год</option>
          <option value="all">Все время</option>
        </select>
      </div>

      {/* Статистика */}
      <RevenueStats
        totalCommission={stats.totalCommission}
        totalCashback={stats.totalCashback}
        totalNetRevenue={stats.totalNetRevenue}
        totalTransactions={stats.totalTransactions}
        byType={stats.byType}
      />

      {/* История транзакций */}
      <RevenueTransactions />
    </div>
  )
}

