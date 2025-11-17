/**
 * Компонент ввода адреса с автодополнением через Nominatim (OpenStreetMap)
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddressSuggestion {
  text: string
  coordinates: {
    lat: number
    lng: number
  }
  placeId: number
  type: string
  importance: number
}

interface AddressInputProps {
  value: string
  coordinates?: { lat: number; lng: number } | null
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
}

export function AddressInput({
  value,
  coordinates,
  onChange,
  placeholder = 'Начните вводить адрес...',
  disabled = false,
  error,
  className,
}: AddressInputProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Синхронизируем значение с пропсом
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Запрос к API геокодера
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/geocoder/suggest-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })

      const data = await response.json()

      if (data.success && data.addresses) {
        setSuggestions(data.addresses)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('[AddressInput] Ошибка запроса:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce для запросов
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (query !== value) {
        fetchSuggestions(query)
      }
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, value, fetchSuggestions]) // fetchSuggestions используется внутри

  // Обработка выбора адреса
  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.text)
    onChange(suggestion.text, suggestion.coordinates)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  // Обработка ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    setSelectedIndex(-1)

    // Если пользователь очистил поле, сбрасываем координаты
    if (!newValue.trim()) {
      onChange('', undefined)
    }
  }

  // Обработка фокуса
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = () => {
    // Задержка для обработки клика по предложению
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectAddress(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="space-y-2">
        <Label htmlFor="address">
          Адрес <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            id="address"
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'pl-10 h-12 text-base',
              error ? 'border-red-500' : '',
              showSuggestions && suggestions.length > 0
                ? 'rounded-b-none border-b-0'
                : ''
            )}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Список предложений */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-0 bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.placeId}
                type="button"
                onClick={() => handleSelectAddress(suggestion)}
                className={cn(
                  'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0',
                  index === selectedIndex ? 'bg-blue-50' : ''
                )}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {suggestion.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {suggestion.type}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {coordinates && !error && (
          <p className="text-xs text-gray-500">
            ✓ Адрес найден на карте
          </p>
        )}

        <p className="text-xs text-gray-500">
          Начните вводить адрес, и мы предложим варианты
        </p>
      </div>
    </div>
  )
}

