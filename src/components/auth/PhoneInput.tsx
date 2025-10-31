/**
 * Компонент ввода номера телефона с форматированием
 * Поддерживает как российские, так и международные номера
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { 
  detectCountryCode, 
  formatPhoneNumber, 
  normalizePhoneNumber,
  getPlaceholder
} from '@/lib/phone/country-codes'
import { usePhoneValidation, createPhoneValidationHandlers } from '@/hooks/usePhoneValidation'

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
  const [hasBlurred, setHasBlurred] = useState(false)
  const isInternalChange = useRef(false)

  // Форматирование номера телефона из чистых цифр
  const formatPhone = (digits: string): { formatted: string; country: any } => {
    if (!digits) return { formatted: '', country: null }

    if (international) {
      // Определяем страну по коду
      const country = detectCountryCode(digits)
      if (country) {
        return { 
          formatted: formatPhoneNumber(digits, country),
          country 
        }
      }
      
      // Если страна не определена, но есть цифры - добавляем + в начало
      return { formatted: '+' + digits, country: null }
    }
    
    // Старая логика для российских номеров (обратная совместимость)
    let cleanDigits = digits
    
    // Если начинается с 8, заменяем на 7
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
    let formatted = ''
    if (cleanDigits.length === 0) formatted = ''
    else if (cleanDigits.length === 1) formatted = '+7'
    else if (cleanDigits.length <= 4) formatted = `+7 (${cleanDigits.slice(1)}`
    else if (cleanDigits.length <= 7) formatted = `+7 (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4)}`
    else if (cleanDigits.length <= 9) formatted = `+7 (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7)}`
    else formatted = `+7 (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7, 9)}-${cleanDigits.slice(9)}`
    
    return { formatted, country: null }
  }

  // Инициализация displayValue из value (ТОЛЬКО при внешнем изменении)
  useEffect(() => {
    // Пропускаем, если это внутреннее изменение из handleChange
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }

    if (value) {
      const digits = value.replace(/\D/g, '')
      const { formatted, country } = formatPhone(digits)
      setDisplayValue(formatted)
      setCurrentCountry(country)
    } else {
      setDisplayValue('')
      setCurrentCountry(null)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    
    // Извлекаем только цифры из введенного значения
    const digits = input.replace(/\D/g, '')
    
    // Форматируем для отображения
    const { formatted, country } = formatPhone(digits)
    
    // Обновляем страну БЕЗ вызова ре-рендера в formatPhone
    setCurrentCountry(country)
    
    // Нормализуем для передачи наверх
    let normalized = ''
    if (digits) {
      if (international) {
        normalized = normalizePhoneNumber(digits)
      } else {
        // Старая логика
        if (digits.startsWith('8')) {
          normalized = '+7' + digits.slice(1)
        } else if (digits.startsWith('7')) {
          normalized = '+' + digits
        } else {
          normalized = '+7' + digits
        }
      }
    }
    
    // Помечаем что это внутреннее изменение
    isInternalChange.current = true
    
    // Обновляем состояние
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

  // Умная валидация с отложенным показом ошибок
  const validation = usePhoneValidation(value, {
    immediate: false, // Не показываем ошибки сразу
    minLengthForValidation: 4, // Минимум 4 цифры
    debounceMs: 500 // Задержка 500мс
  })

  // Обработчики для отслеживания blur/focus
  const { onBlur, onFocus: onFocusHandler } = createPhoneValidationHandlers(setHasBlurred)

  const dynamicPlaceholder = international && currentCountry ? 
    getPlaceholder(currentCountry) : placeholder

  return (
    <div className="space-y-1">
      <Input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          handleFocus(e)
          onFocusHandler()
        }}
        onBlur={onBlur}
        placeholder={dynamicPlaceholder}
        disabled={disabled}
        className={cn(
          "text-base h-12 touch-manipulation",
          validation.shouldShowError && "border-red-500 focus:ring-red-500",
          className
        )}
        style={{ fontSize: '16px' }}
        autoComplete="tel"
        inputMode="numeric"
        {...props}
      />
      
      {/* Сообщение об ошибке */}
      {validation.shouldShowError && (
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
