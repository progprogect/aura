/**
 * Компонент поисковой строки для библиотеки ресурсов
 */

'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icons/Icon'
import { Search, X } from '@/components/ui/icons/catalog-icons'

interface ResourcesSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function ResourcesSearchBar({ value, onChange }: ResourcesSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleSearch = () => {
    if (localValue.trim() !== value) {
      onChange(localValue.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className="relative mb-6">
      <div className="relative">
        <button
          onClick={handleSearch}
          type="button"
          className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Выполнить поиск"
        >
          <Icon
            icon={Search}
            size={20}
            aria-hidden
          />
        </button>

        <input
          type="text"
          id="resources-search"
          placeholder="Поиск ресурсов..."
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full pl-10 pr-10 py-3 
            border rounded-xl text-gray-900 placeholder-gray-500
            focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2
            transition-all duration-200 ease-out
            ${isFocused ? 'shadow-md border-gray-400' : 'shadow-sm border-gray-300'}
          `}
          aria-label="Поиск ресурсов по заголовку и описанию"
          aria-describedby="search-hint"
        />

        {localValue && (
          <button
            onClick={handleClear}
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
            aria-label="Очистить поиск"
          >
            <Icon
              icon={X}
              size={20}
              aria-hidden
            />
          </button>
        )}
      </div>

      <div
        id="search-hint"
        className="mt-2 text-xs text-gray-500"
        role="status"
        aria-live="polite"
      >
        {localValue && localValue !== value ? (
          <span>Нажмите Enter или 🔍 для поиска</span>
        ) : value ? (
          <span>Поиск по заголовку и описанию</span>
        ) : (
          <span>Введите запрос и нажмите Enter</span>
        )}
      </div>
    </div>
  )
}

