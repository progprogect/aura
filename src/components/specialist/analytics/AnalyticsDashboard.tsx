/**
 * Основной компонент дашборда аналитики
 * Объединяет все компоненты и управляет состоянием
 */

'use client'

import { useState, useEffect } from 'react'
import { MetricsCards } from './MetricsCards'
import { PeriodFilter } from './PeriodFilter'
import { TrendChart } from './TrendChart'
import { ConversionFunnel } from './ConversionFunnel'
import { SourcesChart } from './SourcesChart'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react'
import type {
  AnalyticsPeriod,
  MetricsData,
  TrendData,
  FunnelData,
  SourceData
} from '@/lib/analytics/specialist-analytics-service'

interface AnalyticsData {
  metrics: MetricsData
  trends: TrendData
  funnel: FunnelData
  sources: SourceData
  period: {
    start: string
    end: string
    label: string
  }
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('month')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async (selectedPeriod: AnalyticsPeriod) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/specialist/analytics?period=${selectedPeriod}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        const errorMessage = result.details || result.error || 'Ошибка загрузки данных'
        console.error('API Error:', {
          status: response.status,
          error: result.error,
          details: result.details,
          stack: result.stack
        })
        throw new Error(errorMessage)
      }

      setData(result)
    } catch (err) {
      console.error('Ошибка загрузки аналитики:', err)
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(period)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  if (loading && !data) {
    return (
      <div className="space-y-6">
        {/* Skeleton для фильтра */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"
            />
          ))}
        </div>

        {/* Skeleton для карточек */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton для графиков */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Ошибка загрузки данных</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 md:p-12">
          <div className="text-center py-8 md:py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Пока нет данных
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Данные появятся после первых просмотров профиля
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>💡 Совет: Обновите профиль, чтобы привлечь больше внимания</p>
              <p>📤 Поделитесь ссылкой на профиль в соцсетях</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Фильтр периода */}
      <div>
        <PeriodFilter period={period} onPeriodChange={setPeriod} />
        <p className="text-sm text-gray-500 mt-2">{data.period?.label || 'Загрузка...'}</p>
      </div>

      {/* Карточки метрик */}
      <MetricsCards
        profileViews={data.metrics.profileViews}
        contactViews={data.metrics.contactViews}
        consultationRequests={data.metrics.consultationRequests}
        orders={data.metrics.orders}
      />

      {/* График трендов */}
      <TrendChart data={data.trends} />

      {/* Воронка конверсий */}
      <ConversionFunnel data={data.funnel} />

      {/* Источники трафика */}
      <SourcesChart data={data.sources} />
    </div>
  )
}

