/**
 * Контекстный анализатор для генерации умных подсказок
 * Анализирует личный профиль и генерирует контекстные рекомендации
 */

import { openai, MODELS, CHAT_CONFIG } from './openai'
import { PersonalProfile } from './personal-questions-generator'
import { CategoryKey } from '@/config/app'

export interface ContextualHint {
  id: string
  condition: string
  hint: string
  recommendation: string
  icon: string
  priority: 'high' | 'medium' | 'low'
}

export interface ContextualInsights {
  hints: ContextualHint[]
  skipConditions: string[]
  personalizedRecommendations: string[]
  compatibilityScore: number
}

export interface PersonalizationScore {
  genderCompatibility: number
  ageAppropriateness: number
  experienceLevel: number
  communicationStyle: number
  problemSpecificity: number
  culturalFit: number
  overall: number
}

/**
 * Анализирует личный профиль и генерирует контекстные подсказки
 */
export async function analyzePersonalContext(
  profile: PersonalProfile,
  problem: string,
  category: CategoryKey | null
): Promise<ContextualInsights> {
  const prompt = buildContextualAnalysisPrompt(profile, problem, category)
  
  try {
    const response = await openai.chat.completions.create({
      model: MODELS.CHAT,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Профиль: ${JSON.stringify(profile)}, Проблема: ${problem}, Категория: ${category}` }
      ],
      temperature: CHAT_CONFIG.temperature,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content) as {
      hints: ContextualHint[]
      skipConditions: string[]
      personalizedRecommendations: string[]
      compatibilityScore: number
    }

    return {
      hints: result.hints || [],
      skipConditions: result.skipConditions || [],
      personalizedRecommendations: result.personalizedRecommendations || [],
      compatibilityScore: result.compatibilityScore || 0
    }
  } catch (error) {
    console.error('[ContextualAnalyzer] Error:', error)
    
    // Fallback - возвращаем базовые подсказки
    return getFallbackInsights(profile, category)
  }
}

/**
 * Строит промпт для контекстного анализа
 */
function buildContextualAnalysisPrompt(profile: PersonalProfile, problem: string, category: CategoryKey | null): string {
  return `Ты — эксперт по персонализации рекомендаций специалистов.

ЗАДАЧА: Проанализируй личный профиль пользователя и сгенерируй умные подсказки для выбора специалиста.

ПРАВИЛА:
1. Генерируй подсказки на основе статистики и опыта
2. Учитывай пол, возраст, опыт пользователя
3. Предлагай конкретные рекомендации
4. Объясняй, почему эти данные важны

ПРИМЕРЫ ПОДСКАЗОК:
- "Мужчинам обычно больше подходят силовые тренировки"
- "Для работы с тревогой опыт специалиста критичен"
- "Женщинам часто комфортнее с женщинами-психологами"
- "Молодым людям подходят более современные методы"

УСЛОВИЯ ДЛЯ ПОДСКАЗОК:
- gender === 'male' && category === 'fitness' → силовые тренировки
- gender === 'female' && category === 'psychology' → комфорт с женщинами-специалистами
- age === 'young' && category === 'nutrition' → современные подходы
- experience === 'none' && category === 'psychology' → терпеливые специалисты
- age === 'mature' && category === 'fitness' → щадящие программы

ВЕРНИ JSON:
{
  "hints": [
    {
      "id": "gender_fitness",
      "condition": "gender === 'male' && category === 'fitness'",
      "hint": "Мужчинам обычно больше подходят силовые тренировки и функциональный фитнес",
      "recommendation": "Рекомендую тренеров с опытом работы с мужчинами",
      "icon": "💪",
      "priority": "high"
    }
  ],
  "skipConditions": [
    "if age < 25 && category === 'medicine' then skip 'chronic_conditions'"
  ],
  "personalizedRecommendations": [
    "Ищите специалистов с опытом работы с вашей возрастной группой"
  ],
  "compatibilityScore": 85
}

КРИТИЧНО:
- Генерируй только релевантные подсказки
- Используй понятный язык
- Предлагай конкретные действия
- Учитывай культурные особенности`
}

/**
 * Возвращает базовые подсказки в случае ошибки
 */
function getFallbackInsights(profile: PersonalProfile, category: CategoryKey | null): ContextualInsights {
  const hints: ContextualHint[] = []
  
  // Базовые подсказки на основе пола
  if (profile.gender === 'male' && category === 'fitness') {
    hints.push({
      id: 'male_fitness',
      condition: 'gender === male && category === fitness',
      hint: 'Мужчинам обычно больше подходят силовые тренировки',
      recommendation: 'Рекомендую тренеров с опытом работы с мужчинами',
      icon: '💪',
      priority: 'high'
    })
  }
  
  if (profile.gender === 'female' && category === 'psychology') {
    hints.push({
      id: 'female_psychology',
      condition: 'gender === female && category === psychology',
      hint: 'Женщинам часто комфортнее с женщинами-психологами',
      recommendation: 'Рассмотрите специалистов женского пола',
      icon: '👩',
      priority: 'medium'
    })
  }
  
  // Базовые подсказки на основе возраста
  if (profile.age === 'young' && category === 'nutrition') {
    hints.push({
      id: 'young_nutrition',
      condition: 'age === young && category === nutrition',
      hint: 'Молодым людям подходят более современные подходы к питанию',
      recommendation: 'Ищите нутрициологов с современными методами',
      icon: '🥗',
      priority: 'medium'
    })
  }
  
  return {
    hints,
    skipConditions: [],
    personalizedRecommendations: ['Ищите специалистов с опытом работы с вашей возрастной группой'],
    compatibilityScore: 70
  }
}

/**
 * Вычисляет персональный score для специалиста
 */
export function calculatePersonalizationScore(
  specialist: any,
  profile: PersonalProfile,
  category: CategoryKey
): PersonalizationScore {
  let genderCompatibility = 50 // базовый score
  let ageAppropriateness = 50
  let experienceLevel = 50
  let communicationStyle = 50
  let problemSpecificity = 50
  let culturalFit = 50

  // Анализ совместимости по полу
  if (profile.gender === 'male' && category === 'fitness') {
    genderCompatibility = 80 // мужчины предпочитают мужчин-тренеров
  } else if (profile.gender === 'female' && category === 'psychology') {
    genderCompatibility = 75 // женщины часто предпочитают женщин-психологов
  }

  // Анализ по возрасту
  if (profile.age === 'young' && specialist.yearsOfPractice && specialist.yearsOfPractice < 10) {
    ageAppropriateness = 85 // молодым подходят молодые специалисты
  } else if (profile.age === 'mature' && specialist.yearsOfPractice && specialist.yearsOfPractice > 10) {
    ageAppropriateness = 85 // зрелым подходят опытные специалисты
  }

  // Анализ опыта
  if (profile.experience === 'none' && specialist.yearsOfPractice && specialist.yearsOfPractice > 5) {
    experienceLevel = 90 // новичкам нужны опытные специалисты
  } else if (profile.experience === 'regular' && specialist.yearsOfPractice && specialist.yearsOfPractice > 10) {
    experienceLevel = 85 // опытным нужны очень опытные специалисты
  }

  // Общий score
  const overall = Math.round((
    genderCompatibility + 
    ageAppropriateness + 
    experienceLevel + 
    communicationStyle + 
    problemSpecificity + 
    culturalFit
  ) / 6)

  return {
    genderCompatibility,
    ageAppropriateness,
    experienceLevel,
    communicationStyle,
    problemSpecificity,
    culturalFit,
    overall
  }
}

/**
 * Генерирует объяснение выбора специалиста
 */
export function generatePersonalizedExplanation(
  specialist: any,
  profile: PersonalProfile,
  category: CategoryKey
): string {
  const explanations: string[] = []
  
  // Объяснение по полу
  if (profile.gender === 'male' && category === 'fitness') {
    explanations.push('Специализируется на работе с мужчинами')
  } else if (profile.gender === 'female' && category === 'psychology') {
    explanations.push('Опыт работы с женщинами вашего возраста')
  }
  
  // Объяснение по возрасту
  if (profile.age === 'young' && specialist.yearsOfPractice && specialist.yearsOfPractice < 10) {
    explanations.push('Молодой специалист, понимает современные подходы')
  } else if (profile.age === 'mature' && specialist.yearsOfPractice && specialist.yearsOfPractice > 10) {
    explanations.push('Опытный специалист с многолетней практикой')
  }
  
  // Объяснение по опыту
  if (profile.experience === 'none' && specialist.yearsOfPractice && specialist.yearsOfPractice > 5) {
    explanations.push('Терпеливый подход к новичкам')
  }
  
  return explanations.join(', ')
}
