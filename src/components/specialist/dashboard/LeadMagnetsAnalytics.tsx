/**
 * Компонент аналитики покупок лид-магнитов
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Coins, TrendingUp, Package } from 'lucide-react'

interface LeadMagnetStats {
  totalPurchases: number
  totalRevenue: number
  byLeadMagnet: Array<{
    leadMagnetId: string
    leadMagnetTitle: string
    purchaseCount: number
    revenue: number
  }>
}

export function LeadMagnetsAnalytics() {
  const [stats, setStats] = useState<LeadMagnetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/specialist/lead-magnets/analytics')
      const data = await response.json()

      if (response.ok && data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || 'Ошибка загрузки статистики')
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err)
      setError('Произошла ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalPurchases === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Покупки лид-магнитов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              Пока нет покупок лид-магнитов
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Покупки лид-магнитов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Общая статистика */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-900">Всего покупок</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {stats.totalPurchases}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-900">Выручка</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {stats.totalRevenue} баллов
            </div>
          </div>
        </div>

        {/* Статистика по лид-магнитам */}
        {stats.byLeadMagnet.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              По лид-магнитам:
            </h3>
            <div className="space-y-2">
              {stats.byLeadMagnet.map((item) => (
                <div
                  key={item.leadMagnetId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.leadMagnetTitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.purchaseCount} покупок
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.revenue} баллов
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

