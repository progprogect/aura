// Типы для API ответов

export interface SpecialistApiResponse {
  id: string
  firstName: string
  lastName: string
  fullName: string
  avatar: string | null
  slug: string
  category: string
  specializations: string[]
  tagline: string | null
  about: string
  shortAbout: string
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
  customFields: Record<string, any>
}

export interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface GetSpecialistsResponse {
  specialists: SpecialistApiResponse[]
  pagination: PaginationInfo
}

export interface CategoryApiResponse {
  key: string
  name: string
  emoji: string
  isActive: boolean
  order: number
}

export interface GetCategoriesResponse {
  categories: CategoryApiResponse[]
}

export interface ConsultationRequestResponse {
  success: boolean
  requestId: string
}

export interface AnalyticsResponse {
  success: boolean
}

export interface ApiErrorResponse {
  error: string
  details?: any
}

// Утилиты для типизации API ответов
export function isApiError(response: any): response is ApiErrorResponse {
  return response && typeof response.error === 'string'
}

export function isGetSpecialistsResponse(response: any): response is GetSpecialistsResponse {
  return response && 
         Array.isArray(response.specialists) && 
         response.pagination &&
         typeof response.pagination.totalCount === 'number'
}

export function isGetCategoriesResponse(response: any): response is GetCategoriesResponse {
  return response && Array.isArray(response.categories)
}
