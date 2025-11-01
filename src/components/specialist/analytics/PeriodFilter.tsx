/**
 * Фильтр периода для аналитики
 * Адаптивная верстка для мобильных устройств
 * На мобильном - компактные кнопки с переносом
 */

'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AnalyticsPeriod } from '@/lib/analytics/specialist-analytics-service'

interface PeriodFilterProps {
  period: AnalyticsPeriod
  onPeriodChange: (period: AnalyticsPeriod) => void
}

const periods: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' },
  { value: 'all', label: 'Все время' }
]

export function PeriodFilter({ period, onPeriodChange }: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((p) => (
        <Button
          key={p.value}
          variant={period === p.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodChange(p.value)}
          className={cn(
            'text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2 min-w-[60px] md:min-w-auto',
            period === p.value && 'shadow-sm'
          )}
        >
          {p.label}
        </Button>
      ))}
    </div>
  )
}

