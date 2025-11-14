/**
 * Умный поиск ресурсов с ранжированием по релевантности
 * Без использования AI/embeddings - только улучшенный keyword search
 */

import type { ResourceDTO } from './types'

/**
 * Разбивает поисковый запрос на слова и нормализует
 */
export function parseSearchQuery(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(word => word.length >= 2) // Игнорируем слишком короткие слова
}

/**
 * Вычисляет релевантность ресурса для поискового запроса
 * Возвращает число от 0 до 1 (1 = максимальная релевантность)
 */
export function calculateRelevanceScore(
  resource: ResourceDTO,
  searchWords: string[]
): number {
  if (searchWords.length === 0) return 0

  const titleLower = resource.title.toLowerCase()
  const descriptionLower = resource.description.toLowerCase()

  let score = 0
  let matchedWords = 0

  for (const word of searchWords) {
    const titleMatch = titleLower.includes(word)
    const descriptionMatch = descriptionLower.includes(word)

    if (titleMatch) {
      // Точное совпадение в начале заголовка - максимальный приоритет
      if (titleLower.startsWith(word)) {
        score += 10
      }
      // Заголовок начинается с запроса
      else if (titleLower.startsWith(word + ' ')) {
        score += 8
      }
      // Все слова запроса в заголовке
      else if (titleLower.includes(word)) {
        score += 5
      }
      matchedWords++
    } else if (descriptionMatch) {
      // Совпадение в описании - меньший приоритет
      score += 2
      matchedWords++
    }
  }

  // Бонус за точное совпадение всего запроса
  const fullQuery = searchWords.join(' ')
  if (titleLower.includes(fullQuery)) {
    score += 15
  } else if (descriptionLower.includes(fullQuery)) {
    score += 5
  }

  // Нормализуем: учитываем процент совпадения слов
  const matchRatio = matchedWords / searchWords.length
  const normalizedScore = (score * matchRatio) / 100 // Максимальный score ~100

  return Math.min(normalizedScore, 1)
}

/**
 * Ранжирует ресурсы по релевантности
 */
export function rankByRelevance(
  resources: ResourceDTO[],
  searchQuery: string
): ResourceDTO[] {
  if (!searchQuery.trim()) {
    return resources
  }

  const searchWords = parseSearchQuery(searchQuery)

  // Вычисляем релевантность для каждого ресурса
  const resourcesWithScore = resources.map(resource => ({
    resource,
    relevanceScore: calculateRelevanceScore(resource, searchWords),
  }))

  // Сортируем по убыванию релевантности
  resourcesWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore)

  return resourcesWithScore.map(item => item.resource)
}

