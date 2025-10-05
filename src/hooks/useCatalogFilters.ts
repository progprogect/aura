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
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // URL состояние для всех фильтров
  const [category, setCategory] = useURLString('category', FILTER_DEFAULTS.CATEGORY)
  const [experience, setExperience] = useURLString('experience', FILTER_DEFAULTS.EXPERIENCE)
  const [format, setFormat] = useURLArray('format', FILTER_DEFAULTS.FORMAT)
  const [verified, setVerified] = useURLBoolean('verified', FILTER_DEFAULTS.VERIFIED)
  const [sortBy, setSortBy] = useURLString('sortBy', FILTER_DEFAULTS.SORT_BY)
  const [search, setSearch] = useURLString(
    'search',
    FILTER_DEFAULTS.SEARCH
    // Debounce убран - поиск только по Enter/кнопке
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
      // ВАЖНО: обновляем URL ОДНИМ вызовом со ВСЕМИ параметрами!
      const params = new URLSearchParams(searchParams.toString())
      
      // Применяем ВСЕ обновления к URLSearchParams
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined) return
        
        // Default values для сравнения
        const defaults: Record<string, any> = {
          category: FILTER_DEFAULTS.CATEGORY,
          experience: FILTER_DEFAULTS.EXPERIENCE,
          format: FILTER_DEFAULTS.FORMAT,
          verified: FILTER_DEFAULTS.VERIFIED,
          sortBy: FILTER_DEFAULTS.SORT_BY,
          search: FILTER_DEFAULTS.SEARCH,
        }
        
        const defaultValue = defaults[key]
        
        // Сериализация
        let serialized: string
        if (Array.isArray(value)) {
          serialized = value.join(',')
        } else {
          serialized = String(value)
        }
        
        let defaultSerialized: string
        if (Array.isArray(defaultValue)) {
          defaultSerialized = defaultValue.join(',')
        } else {
          defaultSerialized = String(defaultValue)
        }
        
        // Удаляем если default, иначе устанавливаем
        if (serialized === defaultSerialized) {
          params.delete(key)
        } else {
          params.set(key, serialized)
        }
      })
      
      // Обновляем URL ОДИН РАЗ через Next.js router
      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname
      
      console.log('🔵 updateFilters: pushing URL:', newUrl)
      router.push(newUrl, { scroll: false })
    },
    [router, pathname, searchParams]
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

// useCatalogFilter removed - was not used and could cause hook issues
