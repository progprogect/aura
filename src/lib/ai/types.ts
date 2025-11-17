/**
 * Типы для AI модулей
 */

// Базовые типы
export type WorkFormat = 'online' | 'offline' | 'hybrid'
export type CategoryKey = 'psychology' | 'fitness' | 'nutrition' | 'massage' | 'coaching' | 'medicine'

// Custom fields для разных категорий
export interface PsychologyCustomFields {
  methods?: string[]
  worksWith?: string[]
  sessionFormats?: string[]
  sessionDuration?: number
}

export interface FitnessCustomFields {
  trainingTypes?: string[]
  sessionFormats?: string[]
  gymLocation?: string
  achievements?: string[]
}

export interface NutritionCustomFields {
  approaches?: string[]
  specializations?: string[]
  programDuration?: string
}

export type CustomFields = PsychologyCustomFields | FitnessCustomFields | NutritionCustomFields | Record<string, unknown>

// Основной тип специалиста
export interface Specialist {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  slug: string
  profileType?: 'specialist' | 'company'
  companyName?: string
  address?: string
  addressCoordinates?: { lat: number; lng: number }
  taxId?: string
  category: CategoryKey | string
  specializations: string[]
  tagline?: string
  about: string
  city?: string
  country: string
  workFormats: WorkFormat[]
  yearsOfPractice?: number
  priceFrom?: number
  priceTo?: number
  currency: string
  priceDescription?: string
  verified: boolean
  customFields?: CustomFields
  distance?: number // для semantic search results
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
  category?: CategoryKey | string
  workFormats?: WorkFormat[]
  city?: string
  minExperience?: number
  maxPrice?: number
  problem?: string
  preferences?: string
}

// Типы для API responses
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatAPIRequest {
  messages: ChatMessage[]
  sessionId: string
}

export interface AnalyticsTrackRequest {
  event: string
  sessionId: string
  metadata?: Record<string, unknown>
}

// Типы для Prisma where clauses
export interface SpecialistWhereInput {
  id?: { in: string[] } | { notIn: string[] }
  acceptingClients?: boolean
  category?: CategoryKey | string
  workFormats?: { hasSome: WorkFormat[] }
  city?: string
  yearsOfPractice?: { gte: number }
  priceFrom?: { lte: number } | null
  verified?: boolean
  OR?: Array<{ priceFrom: null } | { priceFrom: { lte: number } }>
}

