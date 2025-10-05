/**
 * Chip для множественного выбора
 * Используется для форматов работы
 */

'use client'

import { Icon } from '@/components/ui/icons/Icon'
import { Check } from '@/components/ui/icons/catalog-icons'

interface FilterChipProps {
  label: string
  selected: boolean
  onToggle: () => void
}

/**
 * Chip компонент для множественного выбора
 * Визуально отличается от radio (понятно что можно выбрать несколько)
 */
export function FilterChip({ label, selected, onToggle }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        inline-flex items-center gap-2
        px-3.5 py-2.5 sm:px-4 sm:py-3
        rounded-xl border
        text-sm sm:text-base font-medium
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2
        active:scale-[0.98]
        ${
          selected
            ? 'border-gray-800 bg-gray-800 text-white shadow-sm'
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50/50 hover:shadow-sm'
        }
      `}
      role="checkbox"
      aria-checked={selected}
    >
      {/* Галочка у выбранных */}
      {selected && <Icon icon={Check} size={16} className="flex-shrink-0" aria-hidden />}
      
      {/* Label */}
      <span>{label}</span>
    </button>
  )
}

