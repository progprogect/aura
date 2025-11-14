/**
 * Кнопка открытия панели фильтров для библиотеки ресурсов
 */

'use client'

import { Icon } from '@/components/ui/icons/Icon'
import { Filter, ChevronDown } from '@/components/ui/icons/catalog-icons'

interface ResourcesFilterButtonProps {
  activeFiltersCount: number
  onClick: () => void
  compact?: boolean
}

export function ResourcesFilterButton({
  activeFiltersCount,
  onClick,
  compact = false,
}: ResourcesFilterButtonProps) {
  const hasActiveFilters = activeFiltersCount > 0

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg border transition-all duration-200 min-h-[44px] whitespace-nowrap
        ${compact ? 'flex-1' : ''}
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
      <Icon
        icon={Filter}
        size={16}
        className="flex-shrink-0"
        aria-hidden
      />

      <span className="font-medium text-sm sm:text-base">
        <span className="hidden sm:inline">{hasActiveFilters ? 'Фильтры' : compact ? 'Фильтры' : 'Все фильтры'}</span>
        <span className="sm:hidden">Фильтры</span>
      </span>

      {hasActiveFilters && (
        <span
          className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center flex-shrink-0"
          aria-label={`${activeFiltersCount} активных фильтров`}
        >
          {activeFiltersCount}
        </span>
      )}

      <Icon
        icon={ChevronDown}
        size={16}
        className="flex-shrink-0"
        aria-hidden
      />
    </button>
  )
}

