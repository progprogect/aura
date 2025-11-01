/**
 * График трендов просмотров
 * Адаптивный для мобильных устройств
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import type { TrendData } from '@/lib/analytics/specialist-analytics-service'

// Форматирование даты для графика (краткая версия)
function formatChartDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit'
  })
}

interface TrendChartProps {
  data: TrendData
}

export function TrendChart({ data }: TrendChartProps) {
  // Объединяем данные для графика
  const chartData = data.profileViews.map((point, index) => ({
    date: point.date,
    dateLabel: formatChartDate(point.date),
    просмотры: point.value,
    контакты: data.contactViews[index]?.value || 0
  }))

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">📈 Динамика просмотров</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px] md:h-[300px] min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={250}>
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
                className="text-xs"
              />
              <YAxis tick={{ fontSize: 12 }} className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="просмотры"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="контакты"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

