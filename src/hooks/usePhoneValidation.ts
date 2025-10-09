/**
 * React hook для умной валидации номера телефона
 * Реализует отложенную валидацию и правильный UX
 */

import { useState, useEffect, useMemo } from 'react'
import { validatePhoneNumber } from '@/lib/phone/country-codes'

interface UsePhoneValidationOptions {
  /**
   * Валидировать ли немедленно при изменении (по умолчанию false)
   */
  immediate?: boolean
  
  /**
   * Минимальная длина для начала валидации
   * Если номер короче - не показывать ошибки
   */
  minLengthForValidation?: number
  
  /**
   * Задержка перед показом ошибки (в мс)
   * Позволяет пользователю закончить ввод
   */
  debounceMs?: number
}

interface ValidationResult {
  isValid: boolean
  error?: string
  isPending: boolean // true если ещё ждём debounce
  shouldShowError: boolean // true если нужно показать ошибку пользователю
}

export function usePhoneValidation(
  value: string,
  options: UsePhoneValidationOptions = {}
): ValidationResult {
  const {
    immediate = false,
    minLengthForValidation = 4, // Минимум 4 цифры для начала валидации
    debounceMs = 500
  } = options

  const [hasBlurred, setHasBlurred] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // Извлекаем только цифры для проверки минимальной длины
  const digitCount = useMemo(() => {
    return value.replace(/\D/g, '').length
  }, [value])

  // Базовая валидация
  const validation = useMemo(() => {
    return validatePhoneNumber(value)
  }, [value])

  // Debounced валидация
  useEffect(() => {
    if (!value || digitCount < minLengthForValidation) {
      setIsPending(false)
      return
    }

    if (immediate || hasBlurred) {
      setIsPending(false)
      return
    }

    // Устанавливаем pending на время debounce
    setIsPending(true)
    const timer = setTimeout(() => {
      setIsPending(false)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [value, digitCount, minLengthForValidation, immediate, hasBlurred, debounceMs])

  // Определяем нужно ли показывать ошибку
  const shouldShowError = useMemo(() => {
    // Не показываем ошибку если:
    // 1. Поле пустое
    // 2. Мало цифр для валидации
    // 3. Валидация в процессе (debounce)
    // 4. Номер валидный
    // 5. Номер слишком короткий (меньше 7 цифр)
    if (!value || digitCount < minLengthForValidation || isPending || validation.isValid || digitCount < 7) {
      return false
    }

    // Показываем ошибку если:
    // 1. Валидация немедленная ИЛИ пользователь покинул поле
    // 2. И номер достаточно длинный для валидации
    return (immediate || hasBlurred) && digitCount >= 7
  }, [value, digitCount, minLengthForValidation, isPending, validation.isValid, immediate, hasBlurred])

  return {
    isValid: validation.isValid,
    error: validation.error,
    isPending,
    shouldShowError
  }
}

/**
 * Функция для обработки onBlur события
 */
export function createPhoneValidationHandlers(
  setHasBlurred: (value: boolean) => void
) {
  return {
    onBlur: () => setHasBlurred(true),
    onFocus: () => {
      // Сбрасываем blurred при фокусе для возможности повторной валидации
      // setHasBlurred(false) // Закомментировано - оставляем blurred после первого раза
    }
  }
}
