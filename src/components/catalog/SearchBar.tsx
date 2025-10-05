/**
 * Компонент поисковой строки
 * Версия 2.0 с улучшениями:
 * - Использует lucide-react иконки
 * - Улучшенная accessibility
 * - Debounce встроен в хук
 */

'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/icons/Icon'
import { Search, X } from '@/components/ui/icons/catalog-icons'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative mb-6">
      <div className="relative">
        {/* Иконка поиска */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon
            icon={Search}
            size={20}
            className="text-gray-400"
            aria-hidden
          />
        </div>

        {/* Поле ввода */}
        <input
          type="search"
          id="specialist-search"
          placeholder="Поиск специалистов..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
          `}
          aria-label="Поиск специалистов по имени, специализации и описанию"
          aria-describedby={value ? 'search-hint' : undefined}
        />

        {/* Кнопка очистки */}
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="Очистить поиск"
          >
            <Icon
              icon={X}
              size={20}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-hidden
            />
          </button>
        )}
      </div>

      {/* Подсказка при поиске */}
      {value && (
        <div
          id="search-hint"
          className="mt-2 text-sm text-gray-500"
          role="status"
          aria-live="polite"
        >
          Поиск по имени, специализации и описанию
        </div>
      )}
    </div>
  )
}
