/**
 * Типы для системы каталога специалистов
 * Централизованное место для всех типов, связанных с каталогом
 */

// ========================================
// ФИЛЬТРЫ
// ========================================

/**
 * Состояние фильтров каталога
 */
export interface FilterState {
  category: string
  experience: string
  format: string[]
  verified: boolean
  sortBy: string
  search: string
}

/**
 * Опции для фильтра категорий
 */
export type CategoryFilter = 'all' | string

/**
 * Опции для фильтра опыта
 */
export type ExperienceFilter = 'any' | '0-2' | '2-5' | '5+'

/**
 * Опции для формата работы
 */
export type WorkFormatFilter = 'online' | 'offline' | 'hybrid'

/**
 * Опции для сортировки
 */
export type SortByOption = 'relevance' | 'rating' | 'experience' | 'price'

// ========================================
// КАТЕГОРИИ
// ========================================

/**
 * Конфигурация категории
 */
export interface CategoryConfig {
  key: string
  name: string
  emoji: string
  isActive: boolean
  order: number
}

/**
 * Map категорий для быстрого доступа
 */
export type CategoryMap = Map<string, CategoryConfig>

// ========================================
// СПЕЦИАЛИСТЫ
// ========================================

/**
 * DTO специалиста (что возвращает API)
 */
export interface SpecialistDTO {
  id: string
  firstName: string
  lastName: string
  avatar: string | null
  slug: string
  category: string
  specializations: string[]
  tagline: string | null
  about: string
  city: string | null
  country: string
  workFormats: string[]
  yearsOfPractice: number | null
  priceFrom: number | null
  priceTo: number | null
  currency: string
  priceDescription: string | null
  verified: boolean
  profileViews: number
  averageRating: number
  totalReviews: number
  customFields: Record<string, any> | null
}

/**
 * ViewModel специалиста (что использует UI)
 */
export interface SpecialistViewModel extends SpecialistDTO {
  fullName: string
  shortAbout: string
}

// ========================================
// ПАГИНАЦИЯ
// ========================================

/**
 * Информация о пагинации
 */
export interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ========================================
// API ОТВЕТЫ
// ========================================

/**
 * Ответ API со списком специалистов
 */
export interface GetSpecialistsResponse {
  specialists: SpecialistViewModel[]
  pagination: PaginationInfo
}

/**
 * Ответ API со списком категорий
 */
export interface GetCategoriesResponse {
  categories: CategoryConfig[]
}

/**
 * Ошибка API
 */
export interface ApiError {
  error: string
  details?: any
}

// ========================================
// TYPE GUARDS
// ========================================

/**
 * Проверка на ошибку API
 */
export function isApiError(response: any): response is ApiError {
  return response && typeof response.error === 'string'
}

/**
 * Проверка на успешный ответ со специалистами
 */
export function isGetSpecialistsResponse(
  response: any
): response is GetSpecialistsResponse {
  return (
    response &&
    Array.isArray(response.specialists) &&
    response.pagination &&
    typeof response.pagination.totalCount === 'number'
  )
}

/**
 * Проверка на успешный ответ с категориями
 */
export function isGetCategoriesResponse(
  response: any
): response is GetCategoriesResponse {
  return response && Array.isArray(response.categories)
}

