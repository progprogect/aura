/**
 * Воронка конверсий
 * Визуализация: Просмотры → Контакты → Заявки → Заказы
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import type { FunnelData } from '@/lib/analytics/specialist-analytics-service'

interface ConversionFunnelProps {
  data: FunnelData
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const stages = [
    {
      label: 'Просмотры профиля',
      value: data.profileViews,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      label: 'Просмотры контактов',
      value: data.contactViews,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      conversionRate: data.conversionRates.profileToContact
    },
    {
      label: 'Заявки',
      value: data.consultationRequests,
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      conversionRate: data.conversionRates.contactToRequest
    },
    {
      label: 'Заказы',
      value: data.orders,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      conversionRate: data.conversionRates.requestToOrder
    }
  ]

  const maxValue = Math.max(...stages.map(s => s.value))

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">🎯 Воронка конверсий</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 md:space-y-6">
          {stages.map((stage, index) => {
            const widthPercentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0
            
            return (
              <div key={stage.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {formatNumber(stage.value)}
                    </span>
                    {stage.conversionRate !== undefined && (
                      <span className={`text-xs font-medium ${stage.textColor}`}>
                        ({stage.conversionRate}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-8 md:h-10 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${stage.color} transition-all duration-300 flex items-center justify-end pr-2 md:pr-4`}
                    style={{ width: `${widthPercentage}%` }}
                  >
                    {stage.value > 0 && (
                      <span className="text-white text-xs font-medium">
                        {formatNumber(stage.value)}
                      </span>
                    )}
                  </div>
                </div>
                {index < stages.length - 1 && stage.conversionRate !== undefined && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 pl-2">
                    <span className="text-red-500">↓</span>
                    <span>Конверсия: {stage.conversionRate}%</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

