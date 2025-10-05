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
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border
        text-sm font-medium transition-all duration-200
        ${
          selected
            ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
        }
      `}
      role="checkbox"
      aria-checked={selected}
    >
      {/* Галочка у выбранных */}
      {selected && <Icon icon={Check} size={14} className="flex-shrink-0" aria-hidden />}
      
      {/* Label */}
      <span>{label}</span>
    </button>
  )
}

