/**
 * Централизованный хук для управления фильтрами библиотеки ресурсов
 */

'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useURLString } from './useURLState'
import { ResourceFilterState } from '@/lib/resources/types'
import { FILTER_DEFAULTS } from '@/lib/resources/constants'

interface UseResourcesFiltersReturn {
  filters: ResourceFilterState
  setters: {
    setCategory: (value: string) => void
    setType: (value: string) => void
    setTargetAudience: (value: string) => void
    setSortBy: (value: string) => void
    setSearch: (value: string) => void
  }
  updateFilters: (updates: Partial<ResourceFilterState>) => void
  resetFilters: () => void
  activeFiltersCount: number
  hasActiveFilters: boolean
}

export function useResourcesFilters(): UseResourcesFiltersReturn {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // URL состояние для всех фильтров
  const [category, setCategory] = useURLString('category', FILTER_DEFAULTS.CATEGORY)
  const [type, setType] = useURLString('type', FILTER_DEFAULTS.TYPE)
  const [targetAudience, setTargetAudience] = useURLString('targetAudience', FILTER_DEFAULTS.TARGET_AUDIENCE)
  const [sortBy, setSortBy] = useURLString('sortBy', FILTER_DEFAULTS.SORT_BY)
  const [search, setSearch] = useURLString('search', FILTER_DEFAULTS.SEARCH)

  // Мемоизированное состояние фильтров
  const filters = useMemo<ResourceFilterState>(
    () => ({
      category,
      type,
      targetAudience,
      sortBy,
      search,
    }),
    [category, type, targetAudience, sortBy, search]
  )

  // Setters для отдельных фильтров
  const setters = useMemo(
    () => ({
      setCategory,
      setType,
      setTargetAudience,
      setSortBy,
      setSearch,
    }),
    [setCategory, setType, setTargetAudience, setSortBy, setSearch]
  )

  // Batch update нескольких фильтров
  const updateFilters = useCallback(
    (updates: Partial<ResourceFilterState>) => {
      const params = new URLSearchParams(searchParams.toString())
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined) return
        
        const defaults: Record<string, any> = {
          category: FILTER_DEFAULTS.CATEGORY,
          type: FILTER_DEFAULTS.TYPE,
          targetAudience: FILTER_DEFAULTS.TARGET_AUDIENCE,
          sortBy: FILTER_DEFAULTS.SORT_BY,
          search: FILTER_DEFAULTS.SEARCH,
        }
        
        const defaultValue = defaults[key]
        const serialized = String(value)
        const defaultSerialized = String(defaultValue)
        
        if (serialized === defaultSerialized) {
          params.delete(key)
        } else {
          params.set(key, serialized)
        }
      })
      
      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname
      
      router.push(newUrl, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  // Сброс фильтров
  const resetFilters = useCallback(() => {
    const params = new URLSearchParams()
    router.push(pathname, { scroll: false })
  }, [router, pathname])

  // Подсчет активных фильтров
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (category !== FILTER_DEFAULTS.CATEGORY) count++
    if (type !== FILTER_DEFAULTS.TYPE) count++
    if (targetAudience !== FILTER_DEFAULTS.TARGET_AUDIENCE) count++
    if (sortBy !== FILTER_DEFAULTS.SORT_BY) count++
    if (search && search.trim()) count++
    return count
  }, [category, type, targetAudience, sortBy, search])

  const hasActiveFilters = activeFiltersCount > 0

  return {
    filters,
    setters,
    updateFilters,
    resetFilters,
    activeFiltersCount,
    hasActiveFilters,
  }
}

