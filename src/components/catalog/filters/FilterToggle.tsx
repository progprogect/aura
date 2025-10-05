/**
 * Toggle switch для boolean фильтров
 * Используется для верификации
 */

'use client'

interface FilterToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

/**
 * Toggle switch компонент
 * Современный UI элемент для boolean значений
 */
export function FilterToggle({
  label,
  checked,
  onChange,
  description,
}: FilterToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-0.5">{description}</div>
        )}
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        `}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        {/* Slider */}
        <span
          className={`
            absolute top-0.5 left-0.5
            block w-5 h-5 bg-white rounded-full shadow-sm
            transform transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}

