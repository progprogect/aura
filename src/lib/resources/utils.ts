/**
 * Утилиты для работы с библиотекой ресурсов
 */

import { ResourceFilterState } from './types'
import { FILTER_DEFAULTS } from './constants'

/**
 * Построение параметров для API запроса
 */
export function buildFilterParams(
  filters: ResourceFilterState,
  page: number = 1,
  limit: number = 12
): URLSearchParams {
  const params = new URLSearchParams()

  // Категория
  if (filters.category && filters.category !== FILTER_DEFAULTS.CATEGORY) {
    params.set('category', filters.category)
  }

  // Тип
  if (filters.type && filters.type !== FILTER_DEFAULTS.TYPE) {
    params.set('type', filters.type)
  }


  // Сортировка
  if (filters.sortBy && filters.sortBy !== FILTER_DEFAULTS.SORT_BY) {
    params.set('sortBy', filters.sortBy)
  }

  // Поиск
  if (filters.search && filters.search.trim()) {
    params.set('search', filters.search.trim())
  }

  // Пагинация
  params.set('page', String(page))
  params.set('limit', String(limit))

  return params
}

/**
 * Парсинг фильтров из URL параметров
 */
export function parseURLFilters(searchParams: URLSearchParams): ResourceFilterState {
  return {
    category: searchParams.get('category') || FILTER_DEFAULTS.CATEGORY,
    type: searchParams.get('type') || FILTER_DEFAULTS.TYPE,
    sortBy: searchParams.get('sortBy') || FILTER_DEFAULTS.SORT_BY,
    search: searchParams.get('search') || FILTER_DEFAULTS.SEARCH,
  }
}

