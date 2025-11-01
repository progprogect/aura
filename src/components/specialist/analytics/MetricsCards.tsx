/**
 * Карточки метрик для аналитики
 * Переиспользует стили из DashboardStats
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Eye, MessageCircle, TrendingUp, ShoppingBag } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface MetricsCardsProps {
  profileViews: { total: number; change: number }
  contactViews: { total: number; change: number }
  consultationRequests: { total: number; change: number }
  orders: { total: number; change: number }
}

export function MetricsCards({
  profileViews,
  contactViews,
  consultationRequests,
  orders
}: MetricsCardsProps) {
  const stats = [
    {
      icon: Eye,
      label: 'Просмотров профиля',
      value: profileViews.total,
      change: profileViews.change,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: MessageCircle,
      label: 'Просмотров контактов',
      value: contactViews.total,
      change: contactViews.change,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: ShoppingBag,
      label: 'Заказов услуг',
      value: orders.total,
      change: orders.change,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      label: 'Бесплатных заявок',
      value: consultationRequests.total,
      change: consultationRequests.change,
      color: 'text-gray-600',
      bg: 'bg-gray-50'
    }
  ]

  const formatChange = (change: number): string => {
    if (change === 0) return '0%'
    const sign = change > 0 ? '+' : ''
    return `${sign}${change}%`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isPositive = stat.change > 0
        const isNegative = stat.change < 0
        
        return (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatNumber(stat.value)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`text-xs font-medium ${
                        isPositive
                          ? 'text-green-600'
                          : isNegative
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {isPositive ? '↗' : isNegative ? '↘' : '→'} {formatChange(stat.change)}
                    </span>
                    <span className="text-xs text-gray-500">к предыдущему</span>
                  </div>
                </div>
                <div className={`p-2 md:p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

