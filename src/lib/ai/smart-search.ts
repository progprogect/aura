/**
 * SmartSearch - улучшенный поиск специалистов с учетом контекста
 * Использует AI-ранжирование и персонализированные рекомендации
 */

import { prisma } from '@/lib/db'
import { searchSpecialistsBySemantic, searchSpecialistsByKeyword } from './semantic-search'
import { openai, CHAT_CONFIG } from './openai'
import { CacheManager } from '@/lib/cache-manager-server'
import type { Specialist, CategoryKey } from './types'
import type { QuestionGenerationResult } from './question-generator'
import type { AnalysisContext } from './context-analyzer'

export interface SmartSearchOptions {
  query: string
  collectedData: Record<string, any>
  detectedCategory?: CategoryKey
  conversationHistory: string[]
  limit?: number
  excludeIds?: string[]
}

export interface SmartSearchResult {
  specialists: Specialist[]
  searchMetadata: {
    totalFound: number
    searchMethod: 'semantic' | 'keyword' | 'hybrid'
    confidence: number
    matchReasons: string[]
    appliedFilters: string[]
  }
}

export interface PersonalizedRanking {
  specialistId: string
  score: number
  reasons: string[]
  matchFactors: {
    categoryMatch: number
    workFormatMatch: number
    experienceMatch: number
    priceMatch: number
    preferenceMatch: number
    semanticMatch: number
  }
}

/**
 * Кеш для результатов поиска
 */
const searchCache = CacheManager.getInstance()

/**
 * Умный поиск специалистов с учетом контекста
 */
export async function smartSearch(options: SmartSearchOptions): Promise<SmartSearchResult> {
  const { query, collectedData, detectedCategory, conversationHistory, limit = 10, excludeIds = [] } = options

  // Создаем ключ кеша на основе параметров поиска
  const cacheKey = createSearchCacheKey(options)
  const cached = searchCache.get<SmartSearchResult>(cacheKey)
  
  if (cached) {
    console.log('[SmartSearch] Using cached result')
    return cached
  }

  try {
    // 1. Определяем метод поиска на основе контекста
    const searchMethod = determineSearchMethod(query, collectedData, detectedCategory)
    
    // 2. Выполняем поиск
    let specialists: Specialist[] = []
    let searchConfidence = 0.5

    if (searchMethod === 'semantic') {
      const semanticResult = await searchSpecialistsBySemantic({
        query,
        filters: buildSearchFilters(collectedData, detectedCategory),
        limit: limit * 2, // Берем больше для последующего ранжирования
        excludeIds
      })
      specialists = semanticResult
      searchConfidence = 0.8
    } else if (searchMethod === 'keyword') {
      const keywordResult = await searchSpecialistsByKeyword({
        query,
        filters: buildSearchFilters(collectedData, detectedCategory),
        limit: limit * 2,
        excludeIds
      })
      specialists = keywordResult
      searchConfidence = 0.6
    } else {
      // Hybrid: комбинируем оба метода
      const [semanticResult, keywordResult] = await Promise.all([
        searchSpecialistsBySemantic({
          query,
          filters: buildSearchFilters(collectedData, detectedCategory),
          limit: limit,
          excludeIds
        }),
        searchSpecialistsByKeyword({
          query,
          filters: buildSearchFilters(collectedData, detectedCategory),
          limit: limit,
          excludeIds
        })
      ])
      
      // Объединяем результаты, убираем дубликаты
      const combinedSpecialists = [...semanticResult, ...keywordResult]
      const uniqueSpecialists = combinedSpecialists.filter((specialist, index, self) => 
        index === self.findIndex(s => s.id === specialist.id)
      )
      specialists = uniqueSpecialists
      searchConfidence = 0.7
    }

    // 3. AI-ранжирование с учетом контекста
    const rankedSpecialists = await rankSpecialistsByContext(specialists, {
      query,
      collectedData,
      detectedCategory,
      conversationHistory
    })

    // 4. Ограничиваем результат
    const finalSpecialists = rankedSpecialists.slice(0, limit)

    // 5. Генерируем причины совпадений
    const matchReasons = await generateMatchReasons(finalSpecialists, collectedData, detectedCategory)

    const result: SmartSearchResult = {
      specialists: finalSpecialists,
      searchMetadata: {
        totalFound: specialists.length,
        searchMethod,
        confidence: searchConfidence,
        matchReasons,
        appliedFilters: Object.keys(collectedData).filter(key => collectedData[key])
      }
    }

    // Сохраняем результат в кеш
    searchCache.set(cacheKey, result, 10 * 60 * 1000) // 10 минут

    return result
  } catch (error) {
    console.error('[SmartSearch] Error:', error)
    
    // Fallback к простому поиску
    const fallbackResult = await searchSpecialistsByKeyword({
      query,
      filters: buildSearchFilters(collectedData, detectedCategory),
      limit,
      excludeIds
    })

    return {
      specialists: fallbackResult,
      searchMetadata: {
        totalFound: fallbackResult.length,
        searchMethod: 'keyword',
        confidence: 0.3,
        matchReasons: ['Базовый поиск по ключевым словам'],
        appliedFilters: []
      }
    }
  }
}

/**
 * Определяет метод поиска на основе контекста
 */
function determineSearchMethod(
  query: string, 
  collectedData: Record<string, any>, 
  detectedCategory?: CategoryKey
): 'semantic' | 'keyword' | 'hybrid' {
  // Если есть много контекстных данных - используем semantic
  if (Object.keys(collectedData).length >= 3 && detectedCategory) {
    return 'semantic'
  }
  
  // Если запрос конкретный и короткий - keyword
  if (query.length < 20 && !query.includes(' ')) {
    return 'keyword'
  }
  
  // В остальных случаях - hybrid
  return 'hybrid'
}

/**
 * Строит фильтры поиска на основе собранных данных
 */
function buildSearchFilters(collectedData: Record<string, any>, detectedCategory?: CategoryKey) {
  const filters: any = {}

  // Категория
  if (detectedCategory) {
    filters.category = detectedCategory
  }

  // Формат работы
  if (collectedData.work_format) {
    if (collectedData.work_format === 'hybrid') {
      filters.workFormats = ['online', 'offline']
    } else {
      filters.workFormats = [collectedData.work_format]
    }
  }

  // Опыт работы
  if (collectedData.experience_level) {
    const experienceMap: Record<string, number> = {
      'none': 0,
      'little': 2,
      'regular': 5
    }
    filters.minExperience = experienceMap[collectedData.experience_level] || 0
  }

  // Бюджет (если указан)
  if (collectedData.budget_range) {
    const budgetMap: Record<string, number> = {
      'low': 2000,
      'medium': 3000,
      'high': 5000
    }
    filters.maxPrice = budgetMap[collectedData.budget_range]
  }

  // Город (если формат оффлайн)
  if (collectedData.city && collectedData.work_format === 'offline') {
    filters.city = collectedData.city
  }

  return filters
}

/**
 * AI-ранжирование специалистов с учетом контекста
 */
async function rankSpecialistsByContext(
  specialists: Specialist[],
  context: {
    query: string
    collectedData: Record<string, any>
    detectedCategory?: CategoryKey
    conversationHistory: string[]
  }
): Promise<Specialist[]> {
  if (specialists.length === 0) return specialists

  try {
    const prompt = buildRankingPrompt(specialists, context)
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Контекст: ${JSON.stringify(context)}` }
      ],
      temperature: 0.3, // Низкая температура для консистентности
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Парсим рейтинги
    const rankings = JSON.parse(content) as PersonalizedRanking[]
    
    // Сортируем специалистов по рейтингу
    const sortedSpecialists = specialists.sort((a, b) => {
      const rankingA = rankings.find(r => r.specialistId === a.id)
      const rankingB = rankings.find(r => r.specialistId === b.id)
      
      const scoreA = rankingA?.score || 0
      const scoreB = rankingB?.score || 0
      
      return scoreB - scoreA
    })

    // Добавляем причины совпадений к специалистам
    return sortedSpecialists.map(specialist => {
      const ranking = rankings.find(r => r.specialistId === specialist.id)
      return {
        ...specialist,
        matchReasons: ranking?.reasons || [],
        similarity: ranking?.score || 0
      }
    })
  } catch (error) {
    console.error('[SmartSearch] Ranking error:', error)
    
    // Fallback: простое ранжирование по релевантности
    return specialists.sort((a, b) => {
      const scoreA = calculateSimpleScore(a, context)
      const scoreB = calculateSimpleScore(b, context)
      return scoreB - scoreA
    })
  }
}

/**
 * Строит промпт для AI-ранжирования
 */
function buildRankingPrompt(specialists: Specialist[], context: any): string {
  const specialistsInfo = specialists.map(s => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`,
    category: s.category,
    specializations: s.specializations,
    workFormats: s.workFormats,
    yearsOfPractice: s.yearsOfPractice,
    priceFromInPoints: s.priceFromInPoints,
    about: s.about.substring(0, 200) + '...'
  }))

  return `Ты - AI-система для ранжирования специалистов по релевантности для пользователя.

ЗАДАЧА: Проранжируй специалистов от 0 до 1 по релевантности для пользователя.

ФАКТОРЫ РАНЖИРОВАНИЯ:
1. Соответствие категории (0.3)
2. Формат работы (0.2) 
3. Опыт работы (0.15)
4. Ценовая категория (0.1)
5. Персональные предпочтения (0.15)
6. Семантическое соответствие (0.1)

СПЕЦИАЛИСТЫ:
${JSON.stringify(specialistsInfo, null, 2)}

КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(context, null, 2)}

ВЕРНИ JSON массив:
[
  {
    "specialistId": "id",
    "score": 0.85,
    "reasons": ["Соответствует категории", "Подходящий формат работы"],
    "matchFactors": {
      "categoryMatch": 0.9,
      "workFormatMatch": 0.8,
      "experienceMatch": 0.7,
      "priceMatch": 0.6,
      "preferenceMatch": 0.8,
      "semanticMatch": 0.7
    }
  }
]

ПРАВИЛА:
- score от 0 до 1 (1 = идеальное совпадение)
- reasons - массив причин совпадения (2-3 причины)
- matchFactors - детализация по факторам
- Учитывай специфику категории специалиста
- Приоритет: точность > количество`
}

/**
 * Простое ранжирование (fallback)
 */
function calculateSimpleScore(specialist: Specialist, context: any): number {
  let score = 0.5 // Базовый балл

  // Соответствие категории
  if (context.detectedCategory && specialist.category === context.detectedCategory) {
    score += 0.3
  }

  // Формат работы
  if (context.collectedData.work_format) {
    if (specialist.workFormats.includes(context.collectedData.work_format)) {
      score += 0.2
    }
  }

  // Опыт работы
  if (context.collectedData.experience_level === 'regular' && specialist.yearsOfPractice && specialist.yearsOfPractice >= 5) {
    score += 0.15
  }

  return Math.min(score, 1)
}

/**
 * Генерирует причины совпадений для специалистов
 */
async function generateMatchReasons(
  specialists: Specialist[],
  collectedData: Record<string, any>,
  detectedCategory?: CategoryKey
): Promise<string[]> {
  const reasons: string[] = []

  // Базовые причины
  if (detectedCategory) {
    reasons.push(`Соответствует категории "${detectedCategory}"`)
  }

  if (collectedData.work_format) {
    reasons.push(`Поддерживает формат "${collectedData.work_format}"`)
  }

  if (collectedData.experience_level) {
    reasons.push(`Подходящий уровень опыта`)
  }

  if (Object.keys(collectedData).length >= 3) {
    reasons.push(`Учитывает ваши предпочтения`)
  }

  return reasons
}

/**
 * Получает рекомендации для улучшения поиска
 */
export function getSearchRecommendations(
  result: SmartSearchResult,
  collectedData: Record<string, any>
): string[] {
  const recommendations: string[] = []

  if (result.specialists.length === 0) {
    recommendations.push('Попробуйте расширить критерии поиска')
    recommendations.push('Уточните категорию специалиста')
    return recommendations
  }

  if (result.searchMetadata.confidence < 0.6) {
    recommendations.push('Для более точного подбора уточните дополнительные предпочтения')
  }

  if (!collectedData.work_format) {
    recommendations.push('Укажите предпочтительный формат работы')
  }

  if (result.specialists.length < 3) {
    recommendations.push('Рассмотрите специалистов из смежных категорий')
  }

  return recommendations
}

/**
 * Создает ключ кеша для поиска
 */
function createSearchCacheKey(options: SmartSearchOptions): string {
  const { query, collectedData, detectedCategory, limit } = options
  
  // Создаем стабильный ключ на основе параметров
  const keyData = {
    query: query.toLowerCase().trim(),
    category: detectedCategory,
    data: Object.keys(collectedData).sort().reduce((acc, key) => {
      acc[key] = collectedData[key]
      return acc
    }, {} as Record<string, any>),
    limit
  }
  
  return btoa(JSON.stringify(keyData)).slice(0, 50)
}
