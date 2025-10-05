/**
 * Кнопка открытия панели фильтров
 * Версия 2.0 с улучшениями:
 * - Использует lucide-react иконки
 * - Улучшенная accessibility
 * - Показывает количество активных фильтров
 */

'use client'

import { Icon } from '@/components/ui/icons/Icon'
import { Filter, ChevronDown } from '@/components/ui/icons/catalog-icons'

interface FilterButtonProps {
  activeFiltersCount: number
  totalCount: number
  onClick: () => void
}

export function FilterButton({
  activeFiltersCount,
  totalCount,
  onClick,
}: FilterButtonProps) {
  const hasActiveFilters = activeFiltersCount > 0

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onClick}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
          ${
            hasActiveFilters
              ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }
        `}
        aria-label={`Открыть фильтры${
          hasActiveFilters ? `, активно фильтров: ${activeFiltersCount}` : ''
        }`}
        aria-expanded={false}
        aria-haspopup="dialog"
      >
        {/* Иконка фильтра */}
        <Icon
          icon={Filter}
          size={16}
          className="flex-shrink-0"
          aria-hidden
        />

        {/* Текст */}
        <span className="font-medium">
          {hasActiveFilters ? 'Фильтры' : 'Все фильтры'}
        </span>

        {/* Бейдж с количеством активных фильтров */}
        {hasActiveFilters && (
          <span
            className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center"
            aria-label={`${activeFiltersCount} активных фильтров`}
          >
            {activeFiltersCount}
          </span>
        )}

        {/* Иконка стрелки */}
        <Icon
          icon={ChevronDown}
          size={16}
          className="flex-shrink-0"
          aria-hidden
        />
      </button>

      {/* Счетчик результатов */}
      <div
        className="text-sm text-gray-600"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Найдено {totalCount} {getSpecialistWord(totalCount)}
      </div>
    </div>
  )
}

/**
 * Склонение слова "специалист"
 */
function getSpecialistWord(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  // 11-14 всегда "специалистов"
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'специалистов'
  }

  // 1 - "специалист"
  if (lastDigit === 1) {
    return 'специалист'
  }

  // 2, 3, 4 - "специалиста"
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'специалиста'
  }

  // Остальное - "специалистов"
  return 'специалистов'
}
