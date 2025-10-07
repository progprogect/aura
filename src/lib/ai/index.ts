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

// Smart Search
export {
  smartSearch,
  getSearchRecommendations,
} from './smart-search'
export type {
  SmartSearchOptions,
  SmartSearchResult,
  PersonalizedRanking,
} from './smart-search'

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

// Question Generator
export {
  generateQuestions,
  analyzeDataSufficiency,
  getCachedQuestions,
  setCachedQuestions,
  createCacheKey,
} from './question-generator'
export type {
  StructuredQuestion,
  QuestionOption,
  QuestionContext,
  QuestionGenerationResult,
} from './question-generator'

// Context Analyzer
export {
  analyzeDataSufficiency as analyzeContextSufficiency,
  prioritizeQuestions,
} from './context-analyzer'
export type {
  DataSufficiencyResult,
  AnalysisContext,
} from './context-analyzer'

// Personal Questions Generator
export {
  generatePersonalQuestions,
  validatePersonalData,
} from './personal-questions-generator'
export type {
  PersonalQuestion,
  PersonalDataContext,
  PersonalProfile,
} from './personal-questions-generator'

// Contextual Analyzer
export {
  analyzePersonalContext,
  calculatePersonalizationScore,
  generatePersonalizedExplanation,
} from './contextual-analyzer'
export type {
  ContextualHint,
  ContextualInsights,
  PersonalizationScore,
} from './contextual-analyzer'

// Personalized Search
export {
  rankSpecialistsByPersonalization,
  generatePersonalizedSearchExplanation,
  analyzePersonalizationQuality,
} from './personalized-search'
export type {
  RankedSpecialist,
  PersonalizedSearchParams,
} from './personalized-search'

// Contextual Dialog Analyzer
export {
  analyzeDialogContext,
  analyzeUserType,
  analyzeComplexity,
  generateContextualHints,
  isReadyForSearch,
} from './contextual-dialog-analyzer'
export type {
  DialogStage,
  DialogContext,
} from './contextual-dialog-analyzer'

// MongoDB (внутренний, но экспортируем для scripts)
export {
  saveEmbedding,
  getEmbedding,
  getAllEmbeddings,
  deleteEmbedding,
  countEmbeddings,
  findSimilarEmbeddings,
} from './mongodb-client'

