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
        w-full px-4 py-2.5 rounded-lg border-2 text-left text-sm
        transition-all duration-200
        flex items-center gap-2
        ${
          checked
            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
      role="radio"
      aria-checked={checked}
    >
      {/* Галочка у выбранной */}
      {checked && (
        <Icon icon={Check} size={16} className="flex-shrink-0 text-blue-600" aria-hidden />
      )}
      
      {/* Иконка (если есть) */}
      {icon && <span aria-hidden="true">{icon}</span>}
      
      {/* Label */}
      <span className="flex-1">{label}</span>
    </button>
  )
}

