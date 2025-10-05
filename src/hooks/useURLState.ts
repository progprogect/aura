/**
 * Хуки для синхронизации состояния с URL параметрами
 * Версия 2.0 с улучшениями:
 * - Shallow routing (не вызывает scroll)
 * - Debounce для предотвращения history pollution
 * - Batch updates (множественные изменения = 1 history entry)
 * - replaceState для плавной навигации
 */

'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { DEBOUNCE_DELAYS } from '@/lib/catalog/constants'

// ========================================
// ТИПЫ
// ========================================

interface URLStateOptions<T> {
  defaultValue: T
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
  validate?: (value: T) => boolean
  debounce?: number
  shallow?: boolean // Использовать shallow routing
  replace?: boolean // Использовать replaceState вместо pushState
}

// ========================================
// БАЗОВЫЙ ХУК
// ========================================

/**
 * Базовый хук для синхронизации состояния с URL
 * 
 * @example
 * const [value, setValue] = useURLState('key', {
 *   defaultValue: 'default',
 *   debounce: 300
 * })
 */
export function useURLState<T>(
  key: string,
  options: URLStateOptions<T>
): [T, (value: T) => void, () => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const {
    defaultValue,
    serialize = (value: T) => String(value),
    deserialize = (value: string) => value as T,
    validate = () => true,
    debounce = 0,
    shallow = true, // По умолчанию используем shallow routing
    replace = false, // По умолчанию pushState
  } = options

  // Получение текущего значения из URL
  const getCurrentValue = useCallback((): T => {
    const urlValue = searchParams.get(key)
    if (urlValue === null) return defaultValue

    try {
      const parsed = deserialize(urlValue)
      return validate(parsed) ? parsed : defaultValue
    } catch {
      return defaultValue
    }
  }, [key, searchParams, defaultValue, deserialize, validate])

  const [state, setState] = useState<T>(getCurrentValue)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingUpdateRef = useRef<T | null>(null)

  // Синхронизация с URL изменениями
  useEffect(() => {
    const urlValue = getCurrentValue()
    setState(urlValue)
  }, [getCurrentValue])

  // Выполнение обновления URL (определяем ДО updateURL)
  const performURLUpdate = useCallback(
    (value: T) => {
      console.log(`🔵 performURLUpdate for key="${key}":`, value)
      
      const params = new URLSearchParams(searchParams.toString())
      const serialized = serialize(value)

      console.log(`  serialized:`, serialized)
      console.log(`  defaultValue serialized:`, serialize(defaultValue))
      
      // Удаляем параметр если он равен дефолтному значению
      if (serialized === serialize(defaultValue)) {
        console.log(`  → Removing param (matches default)`)
        params.delete(key)
      } else {
        console.log(`  → Setting param`)
        params.set(key, serialized)
      }

      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname

      console.log(`  newUrl:`, newUrl)
      console.log(`  replace:`, replace, `shallow:`, shallow)

      // Используем replaceState или pushState в зависимости от настроек
      if (replace) {
        console.log(`  → Calling router.replace()`)
        router.replace(newUrl, { scroll: !shallow })
      } else {
        console.log(`  → Calling router.push()`)
        router.push(newUrl, { scroll: !shallow })
      }
      
      console.log(`✅ performURLUpdate done for "${key}"`)
    },
    [key, searchParams, pathname, router, serialize, defaultValue, shallow, replace]
  )

  // Обновление URL с debounce
  const updateURL = useCallback(
    (value: T) => {
      if (!validate(value)) return

      // Обновляем локальное состояние сразу
      setState(value)
      pendingUpdateRef.current = value

      // Если есть debounce, откладываем обновление URL
      if (debounce > 0) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
          const finalValue = pendingUpdateRef.current
          if (finalValue !== null) {
            performURLUpdate(finalValue)
            pendingUpdateRef.current = null
          }
        }, debounce)
      } else {
        performURLUpdate(value)
      }
    },
    [performURLUpdate, validate, debounce]
  )

  // Сброс к дефолтному значению
  const reset = useCallback(() => {
    updateURL(defaultValue)
  }, [updateURL, defaultValue])

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return [state, updateURL, reset]
}

// ========================================
// СПЕЦИАЛИЗИРОВАННЫЕ ХУКИ
// ========================================

/**
 * Хук для строковых параметров с debounce (для поиска)
 * 
 * @example
 * const [search, setSearch] = useURLString('search', '', 300)
 */
export function useURLString(
  key: string,
  defaultValue: string = '',
  debounce: number = 0
) {
  return useURLState(key, {
    defaultValue,
    serialize: (value) => encodeURIComponent(value),
    deserialize: (value) => decodeURIComponent(value),
    validate: (value) => typeof value === 'string',
    debounce,
    shallow: true,
    replace: debounce > 0, // Для debounced параметров используем replaceState
  })
}

/**
 * Хук для boolean параметров
 * 
 * @example
 * const [verified, setVerified] = useURLBoolean('verified', false)
 */
export function useURLBoolean(key: string, defaultValue: boolean = false) {
  return useURLState(key, {
    defaultValue,
    serialize: (value) => (value ? 'true' : 'false'),
    deserialize: (value) => value === 'true',
    validate: (value) => typeof value === 'boolean',
    shallow: true,
  })
}

/**
 * Хук для массивов строк
 * 
 * @example
 * const [format, setFormat] = useURLArray('format', [])
 */
export function useURLArray(key: string, defaultValue: string[] = []) {
  return useURLState(key, {
    defaultValue,
    serialize: (value) => value.join(','),
    deserialize: (value) => (value ? value.split(',').filter(Boolean) : []),
    validate: (value) => Array.isArray(value),
    shallow: true,
  })
}

/**
 * Хук для числовых параметров с валидацией диапазона
 * 
 * @example
 * const [page, setPage] = useURLNumber('page', 1, 1, 100)
 */
export function useURLNumber(
  key: string,
  defaultValue: number = 1,
  min: number = 1,
  max: number = 100
) {
  return useURLState(key, {
    defaultValue,
    serialize: (value) => String(value),
    deserialize: (value) => {
      const num = parseInt(value, 10)
      return isNaN(num) ? defaultValue : num
    },
    validate: (value) => typeof value === 'number' && value >= min && value <= max,
    shallow: true,
  })
}
