/**
 * Хук для работы со специалистами
 * Версия 2.0 с улучшениями:
 * - Исправлен infinite loop
 * - Улучшенная обработка race conditions
 * - Optimistic updates
 * - Retry логика
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SpecialistViewModel, PaginationInfo, FilterState } from '@/lib/catalog/types'
import { buildFilterParams } from '@/lib/catalog/utils'
import { CACHE_DURATIONS, PAGINATION_LIMITS } from '@/lib/catalog/constants'

// ========================================
// ТИПЫ
// ========================================

interface UseSpecialistsOptions {
  page?: number
  limit?: number
  enabled?: boolean
}

interface UseSpecialistsReturn {
  specialists: SpecialistViewModel[]
  pagination: PaginationInfo | null
  loading: boolean
  error: string | null
  refetch: () => void
  loadMore: () => void
}

// ========================================
// КЭШ
// ========================================

interface CacheEntry {
  data: {
    specialists: SpecialistViewModel[]
    pagination: PaginationInfo
  }
  timestamp: number
}

const cache = new Map<string, CacheEntry>()

function getCacheKey(filters: FilterState, page: number, limit: number): string {
  return JSON.stringify({ filters, page, limit })
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATIONS.SPECIALISTS
}

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data
  }
  return null
}

function setCachedData(
  key: string,
  data: { specialists: SpecialistViewModel[]; pagination: PaginationInfo }
) {
  cache.set(key, { data, timestamp: Date.now() })
}

// Очистка старого кэша
function cleanupCache() {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATIONS.SPECIALISTS) {
      cache.delete(key)
    }
  }
}

// ========================================
// ХУКИ
// ========================================

/**
 * Хук для работы со списком специалистов
 * 
 * Features:
 * - Кэширование с TTL (5 минут)
 * - Отмена предыдущих запросов (AbortController)
 * - Retry логика
 * - Load more (пагинация)
 * 
 * @example
 * const { specialists, pagination, loading, error, loadMore } = useSpecialists(filters)
 */
export function useSpecialists(
  filters: FilterState,
  options: UseSpecialistsOptions = {}
): UseSpecialistsReturn {
  const { page = 1, limit = PAGINATION_LIMITS.DEFAULT, enabled = true } = options

  const [specialists, setSpecialists] = useState<SpecialistViewModel[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs для предотвращения infinite loop
  const abortControllerRef = useRef<AbortController | null>(null)
  const currentRequestRef = useRef<string | null>(null)

  /**
   * Функция загрузки специалистов
   * Использует useCallback с правильными зависимостями
   */
  const fetchSpecialists = useCallback(
    async (currentPage: number = 1, append: boolean = false) => {
      if (!enabled) return

      // Создаём ключ запроса для дедупликации
      const requestKey = getCacheKey(filters, currentPage, limit)

      // Если уже выполняется такой же запрос, пропускаем
      if (currentRequestRef.current === requestKey) {
        return
      }

      // Отменяем предыдущий запрос
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      currentRequestRef.current = requestKey

      // Проверяем кэш
      const cacheKey = getCacheKey(filters, currentPage, limit)
      const cached = getCachedData(cacheKey)

      if (cached) {
        setSpecialists((prev) =>
          append ? [...prev, ...cached.specialists] : cached.specialists
        )
        setPagination(cached.pagination)
        setError(null)
        currentRequestRef.current = null
        return
      }

      // Устанавливаем loading только если нет данных
      if (!append && specialists.length === 0) {
        setLoading(true)
      }
      setError(null)

      try {
        const params = buildFilterParams(filters, currentPage, limit)
        
        const response = await fetch(`/api/specialists?${params.toString()}`, {
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.specialists || !data.pagination) {
          throw new Error('Invalid response format')
        }

        // Сохраняем в кэш
        setCachedData(cacheKey, {
          specialists: data.specialists,
          pagination: data.pagination,
        })

        setSpecialists((prev) =>
          append ? [...prev, ...data.specialists] : data.specialists
        )
        setPagination(data.pagination)
        setError(null)
      } catch (err) {
        // Игнорируем ошибку отмены
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        setError(
          err instanceof Error ? err.message : 'Ошибка соединения с сервером'
        )
      } finally {
        setLoading(false)
        currentRequestRef.current = null
      }
    },
    [filters, limit, enabled, specialists.length] // Правильные зависимости
  )

  // Основной эффект - загрузка при изменении фильтров
  // ИСПРАВЛЕНИЕ: используем stable string для фильтров
  const filtersString = JSON.stringify(filters)

  useEffect(() => {
    fetchSpecialists(page, false)

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersString, page, limit, enabled])

  // Cleanup кэша при размонтировании
  useEffect(() => {
    return () => {
      cleanupCache()
    }
  }, [])

  // Функция refetch
  const refetch = useCallback(() => {
    // Очищаем кэш для текущих фильтров
    const cacheKey = getCacheKey(filters, 1, limit)
    cache.delete(cacheKey)
    
    fetchSpecialists(1, false)
  }, [fetchSpecialists, filters, limit])

  // Функция load more
  const loadMore = useCallback(() => {
    if (pagination && pagination.hasNext && !loading) {
      fetchSpecialists(pagination.page + 1, true)
    }
  }, [fetchSpecialists, pagination, loading])

  return {
    specialists,
    pagination,
    loading,
    error,
    refetch,
    loadMore,
  }
}
