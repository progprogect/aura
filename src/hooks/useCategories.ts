/**
 * Хук для работы с категориями специалистов
 * Версия 2.0 с улучшениями:
 * - TTL кэширование (30 минут)
 * - Error retry (3 попытки)
 * - Stale-while-revalidate стратегия
 * - useCategoryMap для быстрого доступа
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { CategoryConfig, CategoryMap } from '@/lib/catalog/types'
import { createCategoryMap } from '@/lib/formatters/category'
import { CACHE_DURATIONS } from '@/lib/catalog/constants'

// ========================================
// ГЛОБАЛЬНЫЙ КЭШ
// ========================================

interface CacheEntry {
  data: CategoryConfig[]
  timestamp: number
}

let categoriesCache: CacheEntry | null = null
let categoriesPromise: Promise<CategoryConfig[]> | null = null

// ========================================
// УТИЛИТЫ КЭША
// ========================================

/**
 * Проверка валидности кэша (TTL = 30 минут)
 */
function isCacheValid(): boolean {
  if (!categoriesCache) return false
  return Date.now() - categoriesCache.timestamp < CACHE_DURATIONS.CATEGORIES
}

/**
 * Получение данных из кэша
 */
function getCachedData(): CategoryConfig[] | null {
  if (isCacheValid() && categoriesCache) {
    return categoriesCache.data
  }
  return null
}

/**
 * Сохранение данных в кэш
 */
function setCachedData(data: CategoryConfig[]): void {
  categoriesCache = {
    data,
    timestamp: Date.now(),
  }
}

/**
 * Очистка кэша (экспортируется для ручного использования)
 */
export function clearCategoriesCache(): void {
  categoriesCache = null
  categoriesPromise = null
}

// ========================================
// FETCH С RETRY
// ========================================

/**
 * Загрузка категорий с retry логикой
 */
async function fetchCategoriesWithRetry(
  maxRetries: number = 3
): Promise<CategoryConfig[]> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('/api/categories')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.categories || !Array.isArray(data.categories)) {
        throw new Error('Invalid response format')
      }
      
      // Сортируем по order
      const sortedCategories = data.categories.sort(
        (a: CategoryConfig, b: CategoryConfig) => a.order - b.order
      )
      
      return sortedCategories
    } catch (error) {
      lastError = error as Error
      
      // Если это не последняя попытка, ждём перед retry
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Failed to fetch categories')
}

// ========================================
// ХУКИ
// ========================================

/**
 * Хук для получения списка категорий
 * 
 * Features:
 * - Кэширование с TTL (30 минут)
 * - Stale-while-revalidate (показывает старые данные пока загружает новые)
 * - Retry логика (3 попытки)
 * - Глобальный кэш (shared между компонентами)
 * 
 * @example
 * const { categories, loading, error, refetch } = useCategories()
 */
export function useCategories() {
  const [categories, setCategories] = useState<CategoryConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Stale-while-revalidate: показываем старые данные сразу
    const cachedData = getCachedData()
    if (cachedData) {
      setCategories(cachedData)
      setLoading(false)
    }

    // Если кэш валиден, не делаем запрос
    if (isCacheValid()) {
      return
    }

    // Если запрос уже выполняется, подключаемся к нему
    if (categoriesPromise) {
      categoriesPromise
        .then((data) => {
          if (mounted) {
            setCategories(data)
            setError(null)
          }
        })
        .catch((err) => {
          if (mounted) {
            setError(err.message)
          }
        })
        .finally(() => {
          if (mounted) {
            setLoading(false)
          }
        })
      return
    }

    // Выполняем новый запрос
    setLoading(true)
    categoriesPromise = fetchCategoriesWithRetry()

    categoriesPromise
      .then((data) => {
        if (mounted) {
          setCachedData(data)
          setCategories(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message)
          categoriesPromise = null // Сбрасываем promise при ошибке
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  // Функция для ручного обновления
  const refetch = useMemo(
    () => () => {
      clearCategoriesCache()
      setLoading(true)
      fetchCategoriesWithRetry()
        .then((data) => {
          setCachedData(data)
          setCategories(data)
          setError(null)
        })
        .catch((err) => {
          setError(err.message)
        })
        .finally(() => {
          setLoading(false)
        })
    },
    []
  )

  return { categories, loading, error, refetch }
}

/**
 * Хук для получения Map категорий (быстрый доступ по ключу)
 * 
 * @example
 * const { categoryMap, loading } = useCategoryMap()
 * const psychologyCategory = categoryMap.get('psychology')
 */
export function useCategoryMap() {
  const { categories, loading, error } = useCategories()

  const categoryMap = useMemo<CategoryMap>(() => {
    return createCategoryMap(categories)
  }, [categories])

  return { categoryMap, loading, error, categories }
}
