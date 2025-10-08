/**
 * Компонент ввода номера телефона с форматированием
 * Поддерживает как российские, так и международные номера
 */

'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { 
  detectCountryCode, 
  formatPhoneNumber, 
  normalizePhoneNumber,
  getPlaceholder,
  validatePhoneNumber 
} from '@/lib/phone/country-codes'

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  onEnter?: () => void
  international?: boolean // Включить поддержку международных номеров
}

export function PhoneInput({
  value,
  onChange,
  onEnter,
  placeholder = "+7 (999) 123-45-67",
  disabled = false,
  className,
  international = true,
  ...props
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [currentCountry, setCurrentCountry] = useState<any>(null)

  // Форматирование номера телефона
  const formatPhone = (input: string) => {
    if (international) {
      // Используем новую логику для международных номеров
      const digits = input.replace(/\D/g, '')
      
      // Если ввод пустой, возвращаем пустую строку
      if (!digits) return ''
      
      // Определяем страну по коду
      const country = detectCountryCode(digits)
      if (country) {
        setCurrentCountry(country)
        return formatPhoneNumber(digits, country)
      }
      
      // Если страна не определена, но есть цифры - показываем как есть
      return input
    }
    
    // Старая логика для российских номеров (обратная совместимость)
    const digits = input.replace(/\D/g, '')
    
    if (!digits) return ''
    
    // Если начинается с 8, заменяем на 7
    let cleanDigits = digits
    if (digits.startsWith('8')) {
      cleanDigits = '7' + digits.slice(1)
    }
    
    // Если не начинается с 7, добавляем 7
    if (cleanDigits && !cleanDigits.startsWith('7')) {
      cleanDigits = '7' + cleanDigits
    }
    
    // Ограничиваем до 11 цифр
    cleanDigits = cleanDigits.slice(0, 11)
    
    // Форматируем для отображения
    if (cleanDigits.length === 0) return ''
    if (cleanDigits.length === 1) return '+7'
    if (cleanDigits.length <= 4) return `+7 (${cleanDigits.slice(1)}`
    if (cleanDigits.length <= 7) return `+7 (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4)}`
    if (cleanDigits.length <= 9) return `+7 (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7)}`
    return `+7 (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7, 9)}-${cleanDigits.slice(9)}`
  }

  // Преобразование отформатированного номера в чистый формат
  const normalizePhone = (formatted: string) => {
    if (international) {
      return normalizePhoneNumber(formatted)
    }
    
    // Старая логика
    const digits = formatted.replace(/\D/g, '')
    if (digits.startsWith('8')) {
      return '+7' + digits.slice(1)
    }
    if (digits.startsWith('7')) {
      return '+' + digits
    }
    return digits
  }

  // Обновляем отображаемое значение при изменении value
  useEffect(() => {
    if (value && value !== normalizePhone(displayValue)) {
      setDisplayValue(formatPhone(value))
    }
  }, [value, international]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formatted = formatPhone(input)
    const normalized = normalizePhone(formatted)
    
    setDisplayValue(formatted)
    onChange(normalized)
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

  const validation = validatePhoneNumber(value)
  const dynamicPlaceholder = international && currentCountry ? 
    getPlaceholder(currentCountry) : placeholder

  return (
    <div className="space-y-1">
      <Input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={dynamicPlaceholder}
        disabled={disabled}
        className={cn(
          "text-base h-12",
          !validation.isValid && "border-red-500 focus:ring-red-500",
          className
        )}
        autoComplete="tel"
        inputMode="numeric"
        {...props}
      />
      
      {/* Сообщение об ошибке */}
      {!validation.isValid && value && (
        <p className="text-sm text-red-500">{validation.error}</p>
      )}
      
      {/* Информация о стране */}
      {validation.isValid && value && currentCountry && international && (
        <p className="text-sm text-gray-500">
          {currentCountry.flag} {currentCountry.name} (+{currentCountry.code})
        </p>
      )}
    </div>
  )
}
