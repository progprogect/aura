/**
 * QuestionGenerator - сервис для генерации структурированных вопросов
 * GPT анализирует запрос и создает персонализированные вопросы с вариантами ответов
 */

import { openai, CHAT_CONFIG } from './openai'
import { CacheManager } from '@/lib/cache-manager-server'
import type { CategoryKey } from './types'

// Типы для структурированных вопросов
export interface QuestionOption {
  value: string
  label: string
  weight?: number // Вес для ранжирования результатов
}

export interface StructuredQuestion {
  id: string
  question: string
  type: 'single_choice' | 'multiple_choice' | 'text' | 'skip'
  options?: QuestionOption[]
  required: boolean
  category: CategoryKey | 'general'
  order: number
  helpText?: string
}

export interface QuestionContext {
  userQuery: string
  detectedCategory?: CategoryKey
  collectedData: Record<string, any>
  conversationHistory: string[]
}

export interface QuestionGenerationResult {
  questions: StructuredQuestion[]
  shouldSearch: boolean
  searchParams?: {
    category: CategoryKey
    problem: string
    workFormats: string[]
    city?: string
    minExperience?: number
    maxPrice?: number
    preferences: Record<string, any>
  }
}

/**
 * Генерирует структурированные вопросы на основе контекста
 */
export async function generateQuestions(context: QuestionContext): Promise<QuestionGenerationResult> {
  const prompt = buildQuestionGenerationPrompt(context)
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Контекст: ${JSON.stringify(context)}` }
      ],
      temperature: CHAT_CONFIG.temperature,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Парсим JSON ответ
    const result = JSON.parse(content) as QuestionGenerationResult
    
    // Валидируем результат
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid questions format')
    }

    return result
  } catch (error) {
    console.error('[QuestionGenerator] Error:', error)
    
    // Fallback - возвращаем базовые вопросы
    return generateFallbackQuestions(context)
  }
}

/**
 * Строит промпт для генерации вопросов
 */
function buildQuestionGenerationPrompt(context: QuestionContext): string {
  return `Ты - AI-помощник для генерации персонализированных вопросов в чате подбора специалистов.

ЗАДАЧА: Проанализируй контекст и создай структурированные вопросы с вариантами ответов.

ПРАВИЛА:
1. Генерируй 2-5 вопросов максимум
2. Каждый вопрос должен иметь понятные варианты ответов
3. Учитывай уже собранные данные (не дублируй)
4. Адаптируй глубину вопросов под тип проблемы
5. НЕ спрашивай про бюджет (только если пользователь сам упомянул)
6. Включай вопросы про пол, возраст, опыт работы со специалистами

КАТЕГОРИИ СПЕЦИАЛИСТОВ:
- psychology: психологи, психотерапевты
- fitness: тренеры, инструкторы
- nutrition: нутрициологи, диетологи  
- massage: массажисты, остеопаты
- coaching: лайф-коучи, бизнес-коучи
- medicine: врачи

ТИПЫ ВОПРОСОВ:
- single_choice: один вариант ответа
- multiple_choice: несколько вариантов
- text: свободный текст
- skip: можно пропустить

ПРИМЕРЫ ВОПРОСОВ:

Для психологии:
{
  "question": "Какой у вас опыт работы с психологами?",
  "type": "single_choice",
  "options": [
    {"value": "none", "label": "Никогда не обращался", "weight": 1},
    {"value": "little", "label": "Был 1-2 раза", "weight": 2},
    {"value": "regular", "label": "Регулярно хожу", "weight": 3}
  ],
  "required": false,
  "category": "psychology"
}

Для фитнеса:
{
  "question": "Какой у вас уровень физической подготовки?",
  "type": "single_choice", 
  "options": [
    {"value": "beginner", "label": "Начинающий", "weight": 1},
    {"value": "intermediate", "label": "Средний", "weight": 2},
    {"value": "advanced", "label": "Продвинутый", "weight": 3}
  ],
  "required": false,
  "category": "fitness"
}

ВЕРНИ JSON:
{
  "questions": [массив вопросов],
  "shouldSearch": boolean,
  "searchParams": {
    "category": "psychology",
    "problem": "краткое описание проблемы",
    "workFormats": ["online"],
    "city": "Москва" | null,
    "minExperience": число | null,
    "maxPrice": число | null,
    "preferences": {
      "gender": "male" | "female" | null,
      "age": "young" | "middle" | "experienced" | null,
      "methods": ["КПТ", "Гештальт"] | null
    }
  }
}

КРИТИЧНО:
- shouldSearch = true только если собрано достаточно данных для поиска
- Не генерируй вопросы если уже есть все нужные данные
- Учитывай специфику категории специалиста
- Делай вопросы понятными и конкретными`
}

/**
 * Fallback вопросы если GPT недоступен
 */
function generateFallbackQuestions(context: QuestionContext): QuestionGenerationResult {
  const baseQuestions: StructuredQuestion[] = [
    {
      id: 'work_format',
      question: 'Какой формат работы удобнее?',
      type: 'single_choice',
      options: [
        { value: 'online', label: 'Онлайн' },
        { value: 'offline', label: 'Оффлайн' },
        { value: 'hybrid', label: 'Неважно' }
      ],
      required: true,
      category: 'general',
      order: 1
    },
    {
      id: 'experience_level',
      question: 'Какой у вас опыт работы со специалистами?',
      type: 'single_choice',
      options: [
        { value: 'none', label: 'Никогда не обращался' },
        { value: 'little', label: 'Был 1-2 раза' },
        { value: 'regular', label: 'Регулярно хожу' }
      ],
      required: false,
      category: 'general',
      order: 2
    }
  ]

  return {
    questions: baseQuestions,
    shouldSearch: false
  }
}

/**
 * Анализирует достаточность собранных данных
 */
export function analyzeDataSufficiency(collectedData: Record<string, any>, category: CategoryKey): {
  isSufficient: boolean
  missingFields: string[]
  confidence: number
} {
  const requiredFields = getRequiredFieldsForCategory(category)
  const missingFields = requiredFields.filter(field => !collectedData[field])
  
  const isSufficient = missingFields.length === 0
  const confidence = Math.max(0, 1 - (missingFields.length / requiredFields.length))
  
  return {
    isSufficient,
    missingFields,
    confidence
  }
}

/**
 * Возвращает обязательные поля для категории
 */
function getRequiredFieldsForCategory(category: CategoryKey): string[] {
  const baseFields = ['work_format']
  
  switch (category) {
    case 'psychology':
      return [...baseFields, 'problem_type']
    case 'fitness':
      return [...baseFields, 'fitness_level']
    case 'nutrition':
      return [...baseFields, 'nutrition_goal']
    case 'massage':
      return [...baseFields, 'massage_type']
    case 'coaching':
      return [...baseFields, 'coaching_area']
    case 'medicine':
      return [...baseFields, 'medical_specialty']
    default:
      return baseFields
  }
}

/**
 * Кеширует сгенерированные вопросы
 */
const cache = CacheManager.getInstance()

export function getCachedQuestions(cacheKey: string): QuestionGenerationResult | null {
  return cache.get<QuestionGenerationResult>(cacheKey)
}

export function setCachedQuestions(cacheKey: string, result: QuestionGenerationResult): void {
  cache.set(cacheKey, result, 30 * 60 * 1000) // 30 минут
}

/**
 * Создает ключ кеша на основе контекста
 */
export function createCacheKey(context: QuestionContext): string {
  const key = `${context.userQuery}_${context.detectedCategory}_${JSON.stringify(context.collectedData)}`
  return btoa(key).slice(0, 50) // Ограничиваем длину ключа
}
