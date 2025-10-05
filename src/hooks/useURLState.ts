'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface URLStateOptions<T> {
  defaultValue: T
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
  validate?: (value: T) => boolean
}

/**
 * Кастомный хук для синхронизации состояния с URL параметрами
 * Обеспечивает стабильность, производительность и простоту использования
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
    validate = () => true
  } = options

  // Получаем текущее значение из URL или используем дефолтное
  const getCurrentValue = useCallback((): T => {
    const urlValue = searchParams.get(key)
    if (urlValue === null) return defaultValue
    
    try {
      const parsed = deserialize(urlValue)
      return validate(parsed) ? parsed : defaultValue
    } catch {
      return defaultValue
    }
  }, [key, searchParams, defaultValue, validate])

  const [state, setState] = useState<T>(getCurrentValue)

  // Синхронизация с URL изменениями
  useEffect(() => {
    const urlValue = getCurrentValue()
    setState(urlValue)
  }, [getCurrentValue])

  // Обновление значения в URL
  const updateURL = useCallback((value: T) => {
    if (!validate(value)) return

    const params = new URLSearchParams(searchParams.toString())
    const serialized = serialize(value)
    
    // Удаляем параметр если он равен дефолтному значению
    if (serialized === serialize(defaultValue)) {
      params.delete(key)
    } else {
      params.set(key, serialized)
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    
    router.push(newUrl)
    setState(value)
  }, [key, searchParams, pathname, router, serialize, deserialize, validate, defaultValue])

  // Сброс к дефолтному значению
  const reset = useCallback(() => {
    updateURL(defaultValue)
  }, [updateURL, defaultValue])

  return [state, updateURL, reset]
}

// Специализированные хуки для разных типов данных
export function useURLString(key: string, defaultValue: string = '') {
  return useURLState(key, {
    defaultValue,
    serialize: (value) => encodeURIComponent(value),
    deserialize: (value) => decodeURIComponent(value),
    validate: (value) => typeof value === 'string'
  })
}

export function useURLBoolean(key: string, defaultValue: boolean = false) {
  return useURLState(key, {
    defaultValue,
    serialize: (value) => value ? 'true' : 'false',
    deserialize: (value) => value === 'true',
    validate: (value) => typeof value === 'boolean'
  })
}

export function useURLArray(key: string, defaultValue: string[] = []) {
  return useURLState(key, {
    defaultValue,
    serialize: (value) => value.join(','),
    deserialize: (value) => value ? value.split(',').filter(Boolean) : [],
    validate: (value) => Array.isArray(value)
  })
}

export function useURLNumber(key: string, defaultValue: number = 1, min: number = 1, max: number = 100) {
  return useURLState(key, {
    defaultValue,
    serialize: (value) => String(value),
    deserialize: (value) => {
      const num = parseInt(value, 10)
      return isNaN(num) ? defaultValue : num
    },
    validate: (value) => typeof value === 'number' && value >= min && value <= max
  })
}
