/**
 * Типы для системы библиотеки ресурсов
 * Централизованное место для всех типов, связанных с библиотекой
 */

import type { LeadMagnetUI } from '@/types/lead-magnet'

// ========================================
// ФИЛЬТРЫ
// ========================================

/**
 * Состояние фильтров библиотеки ресурсов
 */
export interface ResourceFilterState {
  category: string
  type: string
  targetAudience: string
  sortBy: string
  search: string
}

/**
 * Опции для фильтра категорий
 */
export type CategoryFilter = 'all' | string

/**
 * Опции для типа лид-магнита
 */
export type LeadMagnetTypeFilter = 'all' | 'file' | 'link' | 'service'

/**
 * Опции для сортировки
 */
export type SortByOption = 'popularity' | 'date' | 'relevance'

// ========================================
// РЕСУРСЫ
// ========================================

/**
 * DTO ресурса (лид-магнит + данные специалиста)
 */
export interface ResourceDTO {
  id: string
  type: 'file' | 'link' | 'service'
  title: string
  description: string
  emoji: string
  fileUrl?: string | null
  linkUrl?: string | null
  slug?: string | null
  highlights?: string[]
  targetAudience?: string | null
  fileSize?: string | null
  previewUrls?: {
    thumbnail: string
    card: string
    detail: string
  } | null
  viewCount: number
  downloadCount: number
  createdAt: Date
  // Данные специалиста
  specialist: {
    id: string
    slug: string
    category: string
    firstName: string
    lastName: string
  }
}

/**
 * ViewModel ресурса (что использует UI)
 */
export interface ResourceViewModel extends ResourceDTO {
  specialistFullName: string
  popularityScore: number // viewCount + downloadCount для сортировки
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
 * Ответ API со списком ресурсов
 */
export interface GetResourcesResponse {
  resources: ResourceViewModel[]
  pagination: PaginationInfo
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
 * Проверка на успешный ответ с ресурсами
 */
export function isGetResourcesResponse(
  response: any
): response is GetResourcesResponse {
  return (
    response &&
    Array.isArray(response.resources) &&
    response.pagination &&
    typeof response.pagination.totalCount === 'number'
  )
}

