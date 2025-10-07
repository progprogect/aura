/**
 * Компонент ввода номера телефона с форматированием
 */

'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onEnter?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function PhoneInput({
  value,
  onChange,
  onEnter,
  placeholder = "+7 (999) 123-45-67",
  disabled = false,
  className
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  // Форматирование номера телефона
  const formatPhone = (input: string) => {
    // Убираем все символы кроме цифр
    const digits = input.replace(/\D/g, '')
    
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
  }, [value])

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

  return (
    <Input
      type="tel"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "text-base h-12",
        className
      )}
      autoComplete="tel"
      inputMode="numeric"
    />
  )
}
