/**
 * ContextAnalyzer - сервис для анализа достаточности собранных данных
 * Определяет когда можно переходить к поиску специалистов
 */

import type { CategoryKey } from './types'
import type { StructuredQuestion } from './question-generator'

export interface DataSufficiencyResult {
  isSufficient: boolean
  confidence: number
  missingFields: string[]
  recommendations: string[]
  shouldAskMore: boolean
}

export interface AnalysisContext {
  category: CategoryKey
  collectedData: Record<string, any>
  questionsAsked: StructuredQuestion[]
  conversationHistory: string[]
  userQuery: string
}

/**
 * Анализирует достаточность собранных данных для поиска
 */
export function analyzeDataSufficiency(context: AnalysisContext): DataSufficiencyResult {
  const { category, collectedData, questionsAsked, conversationHistory, userQuery } = context
  
  // Базовые обязательные поля
  const requiredFields = getRequiredFieldsForCategory(category)
  const missingRequiredFields = requiredFields.filter(field => !collectedData[field])
  
  // Дополнительные поля для повышения качества поиска
  const recommendedFields = getRecommendedFieldsForCategory(category)
  const missingRecommendedFields = recommendedFields.filter(field => !collectedData[field])
  
  // Анализируем контекст разговора
  const contextAnalysis = analyzeConversationContext(conversationHistory, userQuery)
  
  // Определяем достаточность
  const isSufficient = missingRequiredFields.length === 0 && contextAnalysis.hasBasicInfo
  const confidence = calculateConfidence(collectedData, questionsAsked, contextAnalysis)
  
  // Генерируем рекомендации
  const recommendations = generateRecommendations(
    missingRequiredFields,
    missingRecommendedFields,
    contextAnalysis,
    category
  )
  
  // Определяем нужно ли задавать еще вопросы
  const shouldAskMore = !isSufficient && 
    questionsAsked.length < getMaxQuestionsForCategory(category) &&
    confidence < 0.8

  return {
    isSufficient,
    confidence,
    missingFields: missingRequiredFields,
    recommendations,
    shouldAskMore
  }
}

/**
 * Возвращает обязательные поля для категории
 */
function getRequiredFieldsForCategory(category: CategoryKey): string[] {
  const baseFields = ['work_format']
  
  switch (category) {
    case 'psychology':
      return [...baseFields, 'problem_type', 'experience_level']
    case 'fitness':
      return [...baseFields, 'fitness_level', 'training_goal']
    case 'nutrition':
      return [...baseFields, 'nutrition_goal', 'dietary_restrictions']
    case 'massage':
      return [...baseFields, 'massage_type', 'body_areas']
    case 'coaching':
      return [...baseFields, 'coaching_area', 'life_stage']
    case 'medicine':
      return [...baseFields, 'medical_specialty', 'urgency_level']
    default:
      return baseFields
  }
}

/**
 * Возвращает рекомендуемые поля для категории
 */
function getRecommendedFieldsForCategory(category: CategoryKey): string[] {
  const baseRecommended = ['age_range', 'gender_preference', 'budget_range']
  
  switch (category) {
    case 'psychology':
      return [...baseRecommended, 'therapy_methods', 'session_frequency']
    case 'fitness':
      return [...baseRecommended, 'equipment_access', 'time_availability']
    case 'nutrition':
      return [...baseRecommended, 'cooking_skills', 'lifestyle_type']
    case 'massage':
      return [...baseRecommended, 'pain_level', 'previous_experience']
    case 'coaching':
      return [...baseRecommended, 'coaching_style', 'session_format']
    case 'medicine':
      return [...baseRecommended, 'insurance_type', 'preferred_location']
    default:
      return baseRecommended
  }
}

/**
 * Анализирует контекст разговора
 */
function analyzeConversationContext(conversationHistory: string[], userQuery: string): {
  hasBasicInfo: boolean
  urgencyLevel: 'low' | 'medium' | 'high'
  specificityLevel: 'low' | 'medium' | 'high'
  userEngagement: 'low' | 'medium' | 'high'
} {
  const fullText = [...conversationHistory, userQuery].join(' ').toLowerCase()
  
  // Проверяем наличие базовой информации
  const hasBasicInfo = 
    fullText.includes('психолог') || fullText.includes('тренер') || 
    fullText.includes('нутрициолог') || fullText.includes('массажист') ||
    fullText.includes('коуч') || fullText.includes('врач') ||
    fullText.includes('онлайн') || fullText.includes('оффлайн')
  
  // Определяем уровень срочности
  const urgencyKeywords = ['срочно', 'быстро', 'скорее', 'немедленно', 'экстренно']
  const urgencyLevel = urgencyKeywords.some(keyword => fullText.includes(keyword)) ? 'high' :
    fullText.includes('в ближайшее время') ? 'medium' : 'low'
  
  // Определяем уровень конкретности запроса
  const specificKeywords = ['кпт', 'гештальт', 'силовые', 'кардио', 'кбжу', 'палео']
  const specificityLevel = specificKeywords.some(keyword => fullText.includes(keyword)) ? 'high' :
    fullText.includes('метод') || fullText.includes('подход') ? 'medium' : 'low'
  
  // Определяем вовлеченность пользователя
  const engagementKeywords = ['спасибо', 'понятно', 'да', 'нет', 'уточнить']
  const userEngagement = engagementKeywords.filter(keyword => fullText.includes(keyword)).length > 2 ? 'high' :
    engagementKeywords.some(keyword => fullText.includes(keyword)) ? 'medium' : 'low'
  
  return {
    hasBasicInfo,
    urgencyLevel,
    specificityLevel,
    userEngagement
  }
}

/**
 * Вычисляет уверенность в достаточности данных
 */
function calculateConfidence(
  collectedData: Record<string, any>,
  questionsAsked: StructuredQuestion[],
  contextAnalysis: ReturnType<typeof analyzeConversationContext>
): number {
  let confidence = 0
  
  // Базовые данные (40%)
  const hasWorkFormat = !!collectedData.work_format
  const hasProblemType = !!collectedData.problem_type || !!collectedData.training_goal || !!collectedData.nutrition_goal
  confidence += (hasWorkFormat ? 0.2 : 0) + (hasProblemType ? 0.2 : 0)
  
  // Дополнительные данные (30%)
  const additionalFields = ['experience_level', 'fitness_level', 'age_range', 'gender_preference']
  const additionalScore = additionalFields.filter(field => !!collectedData[field]).length / additionalFields.length
  confidence += additionalScore * 0.3
  
  // Контекст разговора (20%)
  confidence += contextAnalysis.hasBasicInfo ? 0.1 : 0
  confidence += contextAnalysis.specificityLevel === 'high' ? 0.1 : 
    contextAnalysis.specificityLevel === 'medium' ? 0.05 : 0
  
  // Количество заданных вопросов (10%)
  const questionScore = Math.min(questionsAsked.length / 5, 1) * 0.1
  confidence += questionScore
  
  return Math.min(confidence, 1)
}

/**
 * Генерирует рекомендации по улучшению поиска
 */
function generateRecommendations(
  missingRequired: string[],
  missingRecommended: string[],
  contextAnalysis: ReturnType<typeof analyzeConversationContext>,
  category: CategoryKey
): string[] {
  const recommendations: string[] = []
  
  // Рекомендации по обязательным полям
  if (missingRequired.includes('work_format')) {
    recommendations.push('Уточните предпочтительный формат работы (онлайн/оффлайн)')
  }
  
  if (missingRequired.includes('problem_type') || missingRequired.includes('training_goal') || missingRequired.includes('nutrition_goal')) {
    recommendations.push('Опишите конкретную задачу или цель работы со специалистом')
  }
  
  // Рекомендации по дополнительным полям
  if (missingRecommended.length > 0 && contextAnalysis.userEngagement === 'high') {
    recommendations.push('Для более точного подбора уточните дополнительные предпочтения')
  }
  
  // Специфичные рекомендации по категориям
  switch (category) {
    case 'psychology':
      if (missingRecommended.includes('therapy_methods')) {
        recommendations.push('Есть ли предпочтения по методам терапии?')
      }
      break
    case 'fitness':
      if (missingRecommended.includes('equipment_access')) {
        recommendations.push('Какое оборудование доступно для тренировок?')
      }
      break
    case 'nutrition':
      if (missingRecommended.includes('dietary_restrictions')) {
        recommendations.push('Есть ли ограничения в питании или аллергии?')
      }
      break
  }
  
  return recommendations
}

/**
 * Возвращает максимальное количество вопросов для категории
 */
function getMaxQuestionsForCategory(category: CategoryKey): number {
  switch (category) {
    case 'psychology':
      return 6 // Больше вопросов для психологии (важно понять проблему)
    case 'medicine':
      return 5 // Медицина требует детального понимания
    case 'fitness':
    case 'nutrition':
      return 4 // Среднее количество
    case 'massage':
    case 'coaching':
      return 3 // Меньше вопросов для более простых категорий
    default:
      return 4
  }
}

/**
 * Определяет приоритет вопросов для задавания
 */
export function prioritizeQuestions(
  questions: StructuredQuestion[],
  context: AnalysisContext
): StructuredQuestion[] {
  const { category, collectedData } = context
  
  return questions.sort((a, b) => {
    // Обязательные вопросы имеют высший приоритет
    if (a.required && !b.required) return -1
    if (!a.required && b.required) return 1
    
    // Учитываем уже собранные данные
    if (collectedData[a.id] && !collectedData[b.id]) return 1
    if (!collectedData[a.id] && collectedData[b.id]) return -1
    
    // Сортируем по порядку (если есть)
    return 0
  })
}
