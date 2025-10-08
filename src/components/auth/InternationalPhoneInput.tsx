/**
 * Международный компонент ввода номера телефона с автоматическим определением страны
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { 
  CountryCode, 
  COUNTRY_CODES, 
  detectCountryCode, 
  formatPhoneNumber, 
  normalizePhoneNumber,
  getPlaceholder,
  validatePhoneNumber 
} from '@/lib/phone/country-codes'
import { ChevronDown, Search } from 'lucide-react'

interface InternationalPhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  onEnter?: () => void
  defaultCountry?: string // Код страны по умолчанию
}

export function InternationalPhoneInput({
  value,
  onChange,
  onEnter,
  defaultCountry = '7',
  disabled = false,
  className,
  ...props
}: InternationalPhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[defaultCountry])
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Инициализация displayValue из value (только при внешнем изменении)
  useEffect(() => {
    if (value) {
      const digits = value.replace(/\D/g, '')
      const country = detectCountryCode(digits)
      if (country) {
        setSelectedCountry(country)
        setDisplayValue(formatPhoneNumber(digits, country))
      } else {
        setDisplayValue(formatPhoneNumber(digits, selectedCountry))
      }
    } else {
      setDisplayValue('')
    }
  }, [value])

  // Обновляем отображаемое значение при изменении страны
  useEffect(() => {
    if (value) {
      const digits = value.replace(/\D/g, '')
      const formatted = formatPhoneNumber(digits, selectedCountry)
      const normalized = normalizePhoneNumber(digits)
      setDisplayValue(formatted)
      onChange(normalized)
    }
  }, [selectedCountry]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    
    // Извлекаем только цифры
    const digits = input.replace(/\D/g, '')
    
    // Определяем страну по введённым цифрам
    const detectedCountry = detectCountryCode(digits)
    if (detectedCountry && detectedCountry.code !== selectedCountry.code) {
      setSelectedCountry(detectedCountry)
    }
    
    // Форматируем для отображения
    const formatted = formatPhoneNumber(digits, detectedCountry || selectedCountry)
    // Нормализуем для передачи наверх
    const normalized = digits ? normalizePhoneNumber(digits) : ''
    
    setDisplayValue(formatted)
    onChange(normalized)
  }

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country)
    setIsCountrySelectorOpen(false)
    
    // Если есть введённые цифры, переформатируем их под новую страну
    if (displayValue) {
      const digits = displayValue.replace(/\D/g, '')
      const formatted = formatPhoneNumber(digits, country)
      const normalized = normalizePhoneNumber(formatted)
      setDisplayValue(formatted)
      onChange(normalized)
    }
    
    // Фокус на инпут
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter()
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Выделяем весь текст при фокусе
    e.target.select()
  }

  // Фильтрация стран по поисковому запросу
  const filteredCountries = Object.values(COUNTRY_CODES).filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery) ||
    country.flag.includes(searchQuery)
  )

  const validation = validatePhoneNumber(value)

  return (
    <div className="relative">
      <div className="flex">
        {/* Селектор страны */}
        <Popover open={isCountrySelectorOpen} onOpenChange={setIsCountrySelectorOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-12 px-3 border-r-0 rounded-r-none flex items-center space-x-2",
                "hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:ring-offset-0",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.code}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск страны..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3",
                    selectedCountry.code === country.code && "bg-primary/10"
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{country.name}</div>
                    <div className="text-xs text-gray-500">+{country.code}</div>
                  </div>
                  <div className="text-xs text-gray-400">{country.placeholder}</div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Поле ввода номера */}
        <Input
          ref={inputRef}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={getPlaceholder(selectedCountry)}
          disabled={disabled}
          className={cn(
            "h-12 rounded-l-none border-l-0 flex-1",
            !validation.isValid && "border-red-500 focus:ring-red-500",
            className
          )}
          autoComplete="tel"
          inputMode="numeric"
          {...props}
        />
      </div>

      {/* Сообщение об ошибке */}
      {!validation.isValid && (
        <p className="mt-1 text-sm text-red-500">{validation.error}</p>
      )}

      {/* Информация о стране */}
      {validation.isValid && value && (
        <p className="mt-1 text-sm text-gray-500">
          {selectedCountry.name} (+{selectedCountry.code})
        </p>
      )}
    </div>
  )
}
