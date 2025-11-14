/**
 * Хук для работы с ресурсами (лид-магнитами)
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ResourceViewModel, PaginationInfo, ResourceFilterState } from '@/lib/resources/types'
import { buildFilterParams } from '@/lib/resources/utils'
import { CACHE_DURATIONS, PAGINATION_LIMITS } from '@/lib/resources/constants'

interface UseResourcesOptions {
  page?: number
  limit?: number
  enabled?: boolean
}

interface UseResourcesReturn {
  resources: ResourceViewModel[]
  pagination: PaginationInfo | null
  loading: boolean
  error: string | null
  refetch: () => void
  loadMore: () => void
}

interface CacheEntry {
  data: {
    resources: ResourceViewModel[]
    pagination: PaginationInfo
  }
  timestamp: number
}

const cache = new Map<string, CacheEntry>()

function getCacheKey(filters: ResourceFilterState, page: number, limit: number): string {
  return JSON.stringify({ filters, page, limit })
}

function isCacheValid(timestamp: number, hasSearch: boolean): boolean {
  const duration = hasSearch ? CACHE_DURATIONS.SEARCH : CACHE_DURATIONS.RESOURCES
  return Date.now() - timestamp < duration
}

function getCachedData(key: string, hasSearch: boolean) {
  const cached = cache.get(key)
  if (cached && isCacheValid(cached.timestamp, hasSearch)) {
    return cached.data
  }
  return null
}

function setCachedData(
  key: string,
  data: { resources: ResourceViewModel[]; pagination: PaginationInfo },
  hasSearch: boolean
) {
  cache.set(key, { data, timestamp: Date.now() })
}

function cleanupCache() {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATIONS.RESOURCES) {
      cache.delete(key)
    }
  }
}

setInterval(cleanupCache, 5 * 60 * 1000) // Каждые 5 минут

export function useResources(
  filters: ResourceFilterState,
  options: UseResourcesOptions = {}
): UseResourcesReturn {
  const { page = 1, limit = PAGINATION_LIMITS.DEFAULT, enabled = true } = options

  const [resources, setResources] = useState<ResourceViewModel[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const currentRequestRef = useRef<string>('')

  const fetchResources = useCallback(
    async (requestId: string, currentPage: number = page, append: boolean = false) => {
      if (!enabled) return

      try {
        setLoading(true)
        setError(null)

        const cacheKey = getCacheKey(filters, currentPage, limit)
        const hasSearch = !!(filters.search && filters.search.trim())
        const cached = getCachedData(cacheKey, hasSearch)

        if (cached && requestId === currentRequestRef.current) {
          if (append) {
            setResources(prev => [...prev, ...cached.resources])
          } else {
            setResources(cached.resources)
          }
          setPagination(cached.pagination)
          setLoading(false)
          return
        }

        const params = buildFilterParams(filters, currentPage, limit)
        const url = `/api/resources?${params.toString()}`

        const response = await fetch(url, {
          signal: abortControllerRef.current?.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (requestId !== currentRequestRef.current) {
          return
        }

        if (data.error) {
          throw new Error(data.error)
        }

        if (append) {
          setResources(prev => [...prev, ...data.resources])
        } else {
          setResources(data.resources)
        }
        setPagination(data.pagination)
        setCachedData(cacheKey, data, hasSearch)
        setLoading(false)
      } catch (err) {
        if (requestId !== currentRequestRef.current) {
          return
        }

        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        setError(err instanceof Error ? err.message : 'Ошибка загрузки ресурсов')
        setLoading(false)
      }
    },
    [filters, page, limit, enabled]
  )

  const refetch = useCallback(() => {
    const requestId = Date.now().toString()
    currentRequestRef.current = requestId

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    fetchResources(requestId, page, false)
  }, [fetchResources, page])

  const loadMore = useCallback(() => {
    if (!pagination || !pagination.hasNext || loading) return

    const nextPage = pagination.page + 1
    const requestId = Date.now().toString()
    currentRequestRef.current = requestId

    fetchResources(requestId, nextPage, true)
  }, [pagination, loading, fetchResources])

  useEffect(() => {
    const requestId = Date.now().toString()
    currentRequestRef.current = requestId

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    fetchResources(requestId)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchResources])

  return {
    resources,
    pagination,
    loading,
    error,
    refetch,
    loadMore,
  }
}

