/**
 * Утилиты для работы с каталогом
 */

import { FilterState } from './types'
import { FILTER_DEFAULTS } from './constants'

/**
 * Построение параметров для API запроса
 */
export function buildFilterParams(
  filters: FilterState,
  page: number = 1,
  limit: number = 12
): URLSearchParams {
  const params = new URLSearchParams()

  // Категория
  if (filters.category && filters.category !== FILTER_DEFAULTS.CATEGORY) {
    params.set('category', filters.category)
  }

  // Тип профиля
  if (filters.profileType && filters.profileType !== FILTER_DEFAULTS.PROFILE_TYPE) {
    params.set('profileType', filters.profileType)
  }

  // Опыт
  if (filters.experience && filters.experience !== FILTER_DEFAULTS.EXPERIENCE) {
    params.set('experience', filters.experience)
  }

  // Формат работы
  if (filters.format && filters.format.length > 0) {
    params.set('format', filters.format.join(','))
  }

  // Верификация
  if (filters.verified) {
    params.set('verified', 'true')
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
export function parseURLFilters(searchParams: URLSearchParams): FilterState {
  return {
    category: searchParams.get('category') || FILTER_DEFAULTS.CATEGORY,
    profileType: searchParams.get('profileType') || FILTER_DEFAULTS.PROFILE_TYPE,
    experience: searchParams.get('experience') || FILTER_DEFAULTS.EXPERIENCE,
    format: searchParams.get('format')?.split(',').filter(Boolean) || FILTER_DEFAULTS.FORMAT,
    verified: searchParams.get('verified') === 'true',
    sortBy: searchParams.get('sortBy') || FILTER_DEFAULTS.SORT_BY,
    search: searchParams.get('search') || FILTER_DEFAULTS.SEARCH,
  }
}

/**
 * Валидация фильтров
 */
export function validateFilters(filters: Partial<FilterState>): boolean {
  // Валидация категории
  if (filters.category !== undefined && typeof filters.category !== 'string') {
    return false
  }

  // Валидация типа профиля
  if (
    filters.profileType !== undefined &&
    !['all', 'specialist', 'company'].includes(filters.profileType)
  ) {
    return false
  }

  // Валидация опыта
  if (
    filters.experience !== undefined &&
    !['any', '0-2', '2-5', '5+'].includes(filters.experience)
  ) {
    return false
  }

  // Валидация формата
  if (
    filters.format !== undefined &&
    (!Array.isArray(filters.format) ||
      !filters.format.every((f) => ['online', 'offline', 'hybrid'].includes(f)))
  ) {
    return false
  }

  // Валидация верификации
  if (filters.verified !== undefined && typeof filters.verified !== 'boolean') {
    return false
  }

  // Валидация сортировки
  if (
    filters.sortBy !== undefined &&
    !['relevance', 'rating', 'experience', 'price'].includes(filters.sortBy)
  ) {
    return false
  }

  // Валидация поиска
  if (filters.search !== undefined && typeof filters.search !== 'string') {
    return false
  }

  return true
}

/**
 * Подсчёт активных фильтров (включая сортировку)
 */
export function countActiveFilters(filters: FilterState): number {
  let count = 0

  if (filters.category !== FILTER_DEFAULTS.CATEGORY) count++
  if (filters.profileType !== FILTER_DEFAULTS.PROFILE_TYPE) count++
  if (filters.experience !== FILTER_DEFAULTS.EXPERIENCE) count++
  if (filters.format.length > 0) count++
  if (filters.verified) count++
  if (filters.sortBy !== FILTER_DEFAULTS.SORT_BY) count++ // Сортировка считается

  return count
}

/**
 * Сброс фильтров к значениям по умолчанию
 */
export function resetFilters(): FilterState {
  return {
    category: FILTER_DEFAULTS.CATEGORY,
    profileType: FILTER_DEFAULTS.PROFILE_TYPE,
    experience: FILTER_DEFAULTS.EXPERIENCE,
    format: [...FILTER_DEFAULTS.FORMAT],
    verified: FILTER_DEFAULTS.VERIFIED,
    sortBy: FILTER_DEFAULTS.SORT_BY,
    search: FILTER_DEFAULTS.SEARCH,
  }
}

/**
 * Проверка равенства двух состояний фильтров
 */
export function areFiltersEqual(a: FilterState, b: FilterState): boolean {
  return (
    a.category === b.category &&
    a.profileType === b.profileType &&
    a.experience === b.experience &&
    JSON.stringify(a.format) === JSON.stringify(b.format) &&
    a.verified === b.verified &&
    a.sortBy === b.sortBy &&
    a.search === b.search
  )
}

