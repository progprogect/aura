'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  SpecialistApiResponse, 
  PaginationInfo, 
  GetSpecialistsResponse,
  isApiError,
  isGetSpecialistsResponse 
} from '@/lib/types/api'

interface UseSpecialistsFilters {
  category: string
  experience: string
  format: string[]
  verified: boolean
  sortBy: string
  search: string
}

interface UseSpecialistsOptions {
  page?: number
  limit?: number
  enabled?: boolean
}

interface UseSpecialistsReturn {
  specialists: SpecialistApiResponse[]
  pagination: PaginationInfo | null
  loading: boolean
  error: string | null
  refetch: () => void
  loadMore: () => void
}

// Простое кэширование в памяти
const cache = new Map<string, { data: GetSpecialistsResponse; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

function getCacheKey(filters: UseSpecialistsFilters, page: number, limit: number): string {
  return JSON.stringify({ filters, page, limit })
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

/**
 * Кастомный хук для работы с API специалистов
 * Включает кэширование, управление состоянием загрузки и ошибок
 */
export function useSpecialists(
  filters: UseSpecialistsFilters,
  options: UseSpecialistsOptions = {}
): UseSpecialistsReturn {
  const { page = 1, limit = 12, enabled = true } = options
  
  const [specialists, setSpecialists] = useState<SpecialistApiResponse[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchSpecialists = useCallback(async (
    currentFilters: UseSpecialistsFilters,
    currentPage: number = 1,
    append: boolean = false
  ) => {
    if (!enabled) return

    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    const cacheKey = getCacheKey(currentFilters, currentPage, limit)
    
    // Проверяем кэш
    const cached = cache.get(cacheKey)
    if (cached && isCacheValid(cached.timestamp)) {
      setSpecialists(prev => append ? [...prev, ...cached.data.specialists] : cached.data.specialists)
      setPagination(cached.data.pagination)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      // Добавляем параметры фильтрации
      if (currentFilters.category && currentFilters.category !== 'all') {
        params.set('category', currentFilters.category)
      }
      if (currentFilters.experience && currentFilters.experience !== 'any') {
        params.set('experience', currentFilters.experience)
      }
      if (currentFilters.format && currentFilters.format.length > 0) {
        params.set('format', currentFilters.format.join(','))
      }
      if (currentFilters.verified) {
        params.set('verified', 'true')
      }
      if (currentFilters.sortBy && currentFilters.sortBy !== 'relevance') {
        params.set('sortBy', currentFilters.sortBy)
      }
      if (currentFilters.search && currentFilters.search.trim()) {
        params.set('search', currentFilters.search.trim())
      }
      
      params.set('page', String(currentPage))
      params.set('limit', String(limit))
      
      const response = await fetch(`/api/specialists?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      })
      
      const data = await response.json()
      
      if (response.ok && isGetSpecialistsResponse(data)) {
        // Кэшируем результат
        cache.set(cacheKey, { data, timestamp: Date.now() })
        
        setSpecialists(prev => append ? [...prev, ...data.specialists] : data.specialists)
        setPagination(data.pagination)
        setError(null)
      } else if (isApiError(data)) {
        setError(data.error || 'Ошибка загрузки данных')
      } else {
        setError('Некорректный ответ от сервера')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Запрос был отменен, не показываем ошибку
        return
      }
      setError('Ошибка соединения с сервером')
    } finally {
      setLoading(false)
    }
  }, [enabled, limit])

  const refetch = useCallback(() => {
    fetchSpecialists(filters, 1, false)
  }, [fetchSpecialists, filters])

  const loadMore = useCallback(() => {
    if (pagination && pagination.hasNext && !loading) {
      fetchSpecialists(filters, pagination.page + 1, true)
    }
  }, [fetchSpecialists, filters, pagination, loading])

  // Основной эффект для загрузки данных
  useEffect(() => {
    fetchSpecialists(filters, page, false)
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchSpecialists, filters, page])

  // Очистка кэша при размонтировании компонента
  useEffect(() => {
    return () => {
      // Можно добавить логику очистки старых записей кэша
      const now = Date.now()
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key)
        }
      }
    }
  }, [])

  return {
    specialists,
    pagination,
    loading,
    error,
    refetch,
    loadMore
  }
}
