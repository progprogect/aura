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
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        w-full flex items-center justify-between
        px-3.5 py-2.5 sm:px-4 sm:py-3
        rounded-xl border
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2
        active:scale-[0.98]
        ${
          checked
            ? 'border-gray-800 bg-gray-50 hover:bg-gray-100'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50/50 hover:shadow-sm'
        }
      `}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <div className="flex-1 text-left">
        <div className="text-sm sm:text-base font-medium text-gray-900">{label}</div>
        {description && (
          <div className="text-xs sm:text-sm text-gray-600 mt-0.5">{description}</div>
        )}
      </div>

      {/* Toggle switch */}
      <div
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
          ${checked ? 'bg-gray-800' : 'bg-gray-300'}
        `}
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
      </div>
    </button>
  )
}

