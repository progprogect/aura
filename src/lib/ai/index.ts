/**
 * AI модуль - barrel export
 * Публичное API для работы с AI функционалом
 */

// OpenAI клиент
export { openai, MODELS, CHAT_CONFIG } from './openai'

// Embeddings
export {
  generateSpecialistEmbedding,
  generateQueryEmbedding,
  generateAllEmbeddings,
} from './embeddings'

// Semantic search
export {
  searchSpecialistsBySemantic,
  searchSpecialistsByKeyword,
} from './semantic-search'
export type { SearchOptions, SearchFilters } from './semantic-search'

// Prompts
export { getSystemPrompt, getExtractionPrompt } from './prompts'

// Types
export type {
  Specialist,
  CategoryKey,
  WorkFormat,
  CustomFields,
  PsychologyCustomFields,
  FitnessCustomFields,
  NutritionCustomFields,
  ExtractedSearchParams,
  ChatMessage,
  ChatAPIRequest,
  AnalyticsTrackRequest,
} from './types'

// MongoDB (внутренний, но экспортируем для scripts)
export {
  saveEmbedding,
  getEmbedding,
  getAllEmbeddings,
  deleteEmbedding,
  countEmbeddings,
  findSimilarEmbeddings,
} from './mongodb-client'

