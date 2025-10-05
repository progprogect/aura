/**
 * Централизованный хук для управления фильтрами каталога
 * 
 * Features:
 * - Единая точка управления всеми фильтрами
 * - Автоматическая синхронизация с URL
 * - Batch updates (множественные изменения = 1 URL update)
 * - Валидация изменений
 * - Reset функционал
 * - Подсчёт активных фильтров
 */

'use client'

import { useCallback, useMemo } from 'react'
import { useURLString, useURLBoolean, useURLArray } from './useURLState'
import { FilterState } from '@/lib/catalog/types'
import {
  FILTER_DEFAULTS,
  DEBOUNCE_DELAYS,
} from '@/lib/catalog/constants'
import { countActiveFilters, resetFilters as createResetFilters } from '@/lib/catalog/utils'

// ========================================
// ТИПЫ
// ========================================

interface UseCatalogFiltersReturn {
  /** Текущее состояние фильтров */
  filters: FilterState
  
  /** Функции для обновления отдельных фильтров */
  setters: {
    setCategory: (value: string) => void
    setExperience: (value: string) => void
    setFormat: (value: string[]) => void
    setVerified: (value: boolean) => void
    setSortBy: (value: string) => void
    setSearch: (value: string) => void
  }
  
  /** Batch update - обновить несколько фильтров за раз */
  updateFilters: (updates: Partial<FilterState>) => void
  
  /** Сбросить все фильтры к значениям по умолчанию */
  resetFilters: () => void
  
  /** Количество активных фильтров */
  activeFiltersCount: number
  
  /** Проверка наличия активных фильтров */
  hasActiveFilters: boolean
}

// ========================================
// ХУК
// ========================================

/**
 * Централизованное управление фильтрами каталога
 * 
 * @example
 * const { filters, setters, updateFilters, resetFilters, activeFiltersCount } = useCatalogFilters()
 * 
 * // Обновить один фильтр
 * setters.setCategory('psychology')
 * 
 * // Обновить несколько фильтров за раз (batch)
 * updateFilters({
 *   category: 'psychology',
 *   verified: true,
 *   format: ['online']
 * })
 * 
 * // Сбросить все фильтры
 * resetFilters()
 */
export function useCatalogFilters(): UseCatalogFiltersReturn {
  // URL состояние для всех фильтров
  const [category, setCategory] = useURLString('category', FILTER_DEFAULTS.CATEGORY)
  const [experience, setExperience] = useURLString('experience', FILTER_DEFAULTS.EXPERIENCE)
  const [format, setFormat] = useURLArray('format', FILTER_DEFAULTS.FORMAT)
  const [verified, setVerified] = useURLBoolean('verified', FILTER_DEFAULTS.VERIFIED)
  const [sortBy, setSortBy] = useURLString('sortBy', FILTER_DEFAULTS.SORT_BY)
  const [search, setSearch] = useURLString(
    'search',
    FILTER_DEFAULTS.SEARCH,
    DEBOUNCE_DELAYS.SEARCH // Поиск с debounce
  )

  // Мемоизированное состояние фильтров
  const filters = useMemo<FilterState>(
    () => ({
      category,
      experience,
      format,
      verified,
      sortBy,
      search,
    }),
    [category, experience, format, verified, sortBy, search]
  )

  // Setters для отдельных фильтров
  const setters = useMemo(
    () => ({
      setCategory,
      setExperience,
      setFormat,
      setVerified,
      setSortBy,
      setSearch,
    }),
    [setCategory, setExperience, setFormat, setVerified, setSortBy, setSearch]
  )

  // Batch update нескольких фильтров
  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      // Применяем все обновления за раз
      // Каждый setter обновляет URL независимо, но благодаря debounce
      // они объединятся в один history entry
      if (updates.category !== undefined) setCategory(updates.category)
      if (updates.experience !== undefined) setExperience(updates.experience)
      if (updates.format !== undefined) setFormat(updates.format)
      if (updates.verified !== undefined) setVerified(updates.verified)
      if (updates.sortBy !== undefined) setSortBy(updates.sortBy)
      if (updates.search !== undefined) setSearch(updates.search)
    },
    [setCategory, setExperience, setFormat, setVerified, setSortBy, setSearch]
  )

  // Сброс фильтров
  const resetAllFilters = useCallback(() => {
    const defaults = createResetFilters()
    updateFilters(defaults)
  }, [updateFilters])

  // Подсчёт активных фильтров
  const activeFiltersCount = useMemo(() => {
    return countActiveFilters(filters)
  }, [filters])

  // Проверка наличия активных фильтров
  const hasActiveFilters = useMemo(() => {
    return activeFiltersCount > 0 || search.trim().length > 0
  }, [activeFiltersCount, search])

  return {
    filters,
    setters,
    updateFilters,
    resetFilters: resetAllFilters,
    activeFiltersCount,
    hasActiveFilters,
  }
}

/**
 * Хук для получения только части фильтров (для оптимизации ре-рендеров)
 * 
 * @example
 * const { category, setCategory } = useCatalogFilter('category')
 */
export function useCatalogFilter<K extends keyof FilterState>(
  filterKey: K
): [FilterState[K], (value: FilterState[K]) => void] {
  const { filters, setters } = useCatalogFilters()
  
  const value = filters[filterKey]
  const setter = useMemo(() => {
    switch (filterKey) {
      case 'category':
        return setters.setCategory as (value: FilterState[K]) => void
      case 'experience':
        return setters.setExperience as (value: FilterState[K]) => void
      case 'format':
        return setters.setFormat as (value: FilterState[K]) => void
      case 'verified':
        return setters.setVerified as (value: FilterState[K]) => void
      case 'sortBy':
        return setters.setSortBy as (value: FilterState[K]) => void
      case 'search':
        return setters.setSearch as (value: FilterState[K]) => void
      default:
        throw new Error(`Unknown filter key: ${filterKey}`)
    }
  }, [filterKey, setters])

  return [value, setter]
}

