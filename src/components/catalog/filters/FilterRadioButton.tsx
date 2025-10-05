/**
 * Radio button стилизованный как кнопка
 * Используется для одиночного выбора (категории, опыт, сортировка)
 */

'use client'

import { Icon } from '@/components/ui/icons/Icon'
import { Check } from '@/components/ui/icons/catalog-icons'

interface FilterRadioButtonProps {
  label: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  icon?: string
}

/**
 * Стилизованная radio кнопка для фильтров
 * Консистентна с FilterButton/SortButton
 */
export function FilterRadioButton({
  label,
  value,
  checked,
  onChange,
  icon,
}: FilterRadioButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`
        w-full text-left
        px-3.5 py-2.5 sm:px-4 sm:py-3
        rounded-xl border
        font-medium text-sm sm:text-base
        transition-all duration-200 ease-out
        flex items-center gap-2.5
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2
        active:scale-[0.98]
        ${
          checked
            ? 'border-gray-800 bg-gray-50 text-gray-900 ring-2 ring-gray-800/10 shadow-sm'
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50/50 hover:shadow-sm'
        }
      `}
      role="radio"
      aria-checked={checked}
    >
      {/* Галочка у выбранной */}
      {checked && (
        <Icon icon={Check} size={18} className="flex-shrink-0 text-gray-900" aria-hidden />
      )}
      
      {/* Иконка (если есть) */}
      {icon && <span className="text-lg" aria-hidden="true">{icon}</span>}
      
      {/* Label */}
      <span className="flex-1">{label}</span>
    </button>
  )
}

