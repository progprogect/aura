/**
 * График источников трафика
 * Без AI-чата (только catalog, search, direct)
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { SourceData } from '@/lib/analytics/specialist-analytics-service'
import { formatNumber } from '@/lib/utils'

interface SourcesChartProps {
  data: SourceData
}

const COLORS = {
  catalog: '#3b82f6', // blue
  search: '#10b981', // green
  direct: '#6366f1' // indigo
}

const LABELS = {
  catalog: 'Каталог',
  search: 'Поиск',
  direct: 'Прямой переход'
}

export function SourcesChart({ data }: SourcesChartProps) {
  const chartData = [
    { name: LABELS.catalog, value: data.catalog.count, percentage: data.catalog.percentage },
    { name: LABELS.search, value: data.search.count, percentage: data.search.percentage },
    { name: LABELS.direct, value: data.direct.count, percentage: data.direct.percentage }
  ].filter(item => item.value > 0) // Показываем только источники с данными

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">🔍 Источники трафика</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Пока нет данных об источниках трафика
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg">🔍 Источники трафика</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Диаграмма */}
          <div className="w-full h-[250px] md:h-[300px] min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => {
                    const colorKey = entry.name === LABELS.catalog 
                      ? 'catalog' 
                      : entry.name === LABELS.search 
                        ? 'search' 
                        : 'direct'
                    return (
                      <Cell key={`cell-${index}`} fill={COLORS[colorKey]} />
                    )
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => formatNumber(value)}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => {
                    const item = chartData.find(d => d.name === value)
                    return item ? `${value} (${item.percentage}%)` : value
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Детализация */}
          <div className="space-y-2 pt-2 border-t border-gray-200">
            {chartData.map((item) => {
              const colorKey = item.name === LABELS.catalog 
                ? 'catalog' 
                : item.name === LABELS.search 
                  ? 'search' 
                  : 'direct'
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[colorKey] }}
                    />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">
                      {formatNumber(item.value)}
                    </span>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

