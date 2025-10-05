'use client'

import { FilterState } from './CatalogContent'

interface FilterButtonProps {
  filters: FilterState
  totalCount: number
  onClick: () => void
}

export function FilterButton({ filters, totalCount, onClick }: FilterButtonProps) {
  // Подсчет активных фильтров
  const activeFiltersCount = [
    filters.category !== 'all',
    filters.experience !== 'any',
    filters.format.length > 0,
    filters.verified,
    filters.sortBy !== 'relevance',
  ].filter(Boolean).length
  
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onClick}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
          ${activeFiltersCount > 0
            ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
          />
        </svg>
        
        <span className="font-medium">
          {activeFiltersCount > 0 ? 'Фильтры' : 'Все фильтры'}
        </span>
        
        {activeFiltersCount > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
            {activeFiltersCount}
          </span>
        )}
        
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {/* Счетчик результатов */}
      <div className="text-sm text-gray-600">
        Найдено {totalCount} специалист{totalCount === 1 ? '' : totalCount < 5 ? 'а' : 'ов'}
      </div>
    </div>
  )
}
