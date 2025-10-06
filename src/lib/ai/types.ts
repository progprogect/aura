/**
 * Типы для AI модулей
 */

export interface Specialist {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  slug: string
  category: string
  specializations: string[]
  tagline?: string
  about: string
  city?: string
  country: string
  workFormats: string[]
  yearsOfPractice?: number
  priceFrom?: number
  priceTo?: number
  currency: string
  priceDescription?: string
  verified: boolean
  customFields?: Record<string, any>
}

export interface SearchFilters {
  category?: string
  workFormats?: string[]
  city?: string
  minExperience?: number
  maxPrice?: number
  verified?: boolean
}

export interface SearchOptions {
  query: string
  filters?: SearchFilters
  limit?: number
  excludeIds?: string[]
}

export interface ExtractedSearchParams {
  shouldSearch: boolean
  query: string
  category?: string
  workFormats?: string[]
  city?: string
  minExperience?: number
  maxPrice?: number
}

