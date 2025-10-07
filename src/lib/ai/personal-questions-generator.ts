/**
 * Генератор персональных вопросов для сбора личных данных
 * Анализирует запрос пользователя и генерирует релевантные вопросы о личных данных
 */

import { openai, MODELS, CHAT_CONFIG } from './openai'
import { CategoryKey } from '@/config/app'

export interface PersonalQuestion {
  id: string
  field: 'gender' | 'age' | 'experience' | 'physical_condition' | 'lifestyle' | 'preferences' | 'communication_style' | 'goals'
  question: string
  type: 'single_choice' | 'multiple_choice' | 'text' | 'number'
  options?: Array<{
    value: string
    label: string
    explanation?: string
  }>
  importance: 'critical' | 'important' | 'optional'
  reasoning: string
  skipConditions?: string[]
}

export interface PersonalDataContext {
  problemType: string
  detectedCategory: CategoryKey | null
  urgencyLevel: 'low' | 'medium' | 'high'
  complexityLevel: 'simple' | 'medium' | 'complex'
  suggestedPersonalFields: PersonalQuestion[]
}

export interface PersonalProfile {
  gender?: 'male' | 'female'
  age?: 'young' | 'middle' | 'mature'
  experience?: 'none' | 'little' | 'regular'
  physical_condition?: 'beginner' | 'intermediate' | 'advanced'
  lifestyle?: 'active' | 'moderate' | 'sedentary'
  preferences?: string[]
  communication_style?: 'formal' | 'casual' | 'supportive'
  goals?: string[]
}

/**
 * Генерирует персональные вопросы на основе запроса пользователя
 */
export async function generatePersonalQuestions(userQuery: string): Promise<PersonalDataContext> {
  const prompt = buildPersonalQuestionsPrompt(userQuery)
  
  try {
    const response = await openai.chat.completions.create({
      model: MODELS.CHAT,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Запрос пользователя: "${userQuery}"` }
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
      problemType: string
      detectedCategory: CategoryKey | null
      urgencyLevel: 'low' | 'medium' | 'high'
      complexityLevel: 'simple' | 'medium' | 'complex'
      questions: PersonalQuestion[]
      reasoning: string
    }

    // Валидируем результат
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid questions format')
    }

    return {
      problemType: result.problemType,
      detectedCategory: result.detectedCategory,
      urgencyLevel: result.urgencyLevel,
      complexityLevel: result.complexityLevel,
      suggestedPersonalFields: result.questions
    }
  } catch (error) {
    console.error('[PersonalQuestionsGenerator] Error:', error)
    
    // Fallback - возвращаем базовые вопросы
    return {
      problemType: userQuery,
      detectedCategory: null,
      urgencyLevel: 'medium',
      complexityLevel: 'medium',
      suggestedPersonalFields: getFallbackQuestions()
    }
  }
}

/**
 * Строит промпт для генерации персональных вопросов
 */
function buildPersonalQuestionsPrompt(userQuery: string): string {
  return `Ты — эксперт по персонализации подбора специалистов.

ЗАДАЧА: Проанализируй запрос пользователя и сгенерируй 3-5 вопросов о личных данных, которые критично важны для подбора специалиста.

ПРАВИЛА:
1. Генерируй только те вопросы, которые влияют на выбор специалиста
2. Учитывай специфику проблемы и категории
3. ВСЕГДА включай пол и возраст (критично для всех категорий)
4. Добавляй специфичные для категории вопросы

КАТЕГОРИИ И ВАЖНЫЕ ДАННЫЕ:
- psychology: пол, возраст, опыт терапии, стиль общения
- fitness: пол, возраст, физическая подготовка, травмы
- nutrition: возраст, здоровье, образ жизни, ограничения
- massage: пол, возраст, проблемы со здоровьем, предпочтения
- coaching: возраст, опыт, цели, стиль мотивации
- medicine: возраст, пол, история болезней, предпочтения

ВАЖНЫЕ ПОЛЯ:
- gender: пол (критично для всех категорий)
- age: возраст (критично для всех категорий)
- experience: опыт работы со специалистами
- physical_condition: физическая подготовка (для фитнеса)
- lifestyle: образ жизни (для питания)
- preferences: предпочтения по методам работы
- communication_style: стиль общения (для психологии)
- goals: цели и задачи

ВЕРНИ JSON:
{
  "problemType": "краткое описание проблемы",
  "detectedCategory": "psychology" | "fitness" | "nutrition" | "massage" | "coaching" | "medicine" | null,
  "urgencyLevel": "low" | "medium" | "high",
  "complexityLevel": "simple" | "medium" | "complex",
  "questions": [
    {
      "id": "gender",
      "field": "gender",
      "question": "Ваш пол?",
      "type": "single_choice",
      "options": [
        {"value": "male", "label": "Мужской"},
        {"value": "female", "label": "Женский"}
      ],
      "importance": "critical",
      "reasoning": "Пол влияет на выбор специалиста и подход к работе"
    }
  ],
  "reasoning": "Объяснение, почему именно эти вопросы важны для данного запроса"
}

КРИТИЧНО:
- ВСЕГДА включай пол и возраст
- Максимум 5 вопросов
- Делай вопросы понятными и конкретными
- Учитывай специфику категории специалиста`
}

/**
 * Возвращает базовые вопросы в случае ошибки
 */
function getFallbackQuestions(): PersonalQuestion[] {
  return [
    {
      id: 'gender',
      field: 'gender',
      question: 'Ваш пол?',
      type: 'single_choice',
      options: [
        { value: 'male', label: 'Мужской' },
        { value: 'female', label: 'Женский' }
      ],
      importance: 'critical',
      reasoning: 'Пол влияет на выбор специалиста и подход к работе'
    },
    {
      id: 'age',
      field: 'age',
      question: 'Ваш возраст?',
      type: 'single_choice',
      options: [
        { value: 'young', label: '18-25 лет' },
        { value: 'middle', label: '26-45 лет' },
        { value: 'mature', label: '45+ лет' }
      ],
      importance: 'critical',
      reasoning: 'Возраст влияет на подход к работе и выбор специалиста'
    },
    {
      id: 'experience',
      field: 'experience',
      question: 'Есть ли опыт работы со специалистами в этой области?',
      type: 'single_choice',
      options: [
        { value: 'none', label: 'Никогда не обращался' },
        { value: 'little', label: 'Был 1-2 раза' },
        { value: 'regular', label: 'Регулярно хожу' }
      ],
      importance: 'important',
      reasoning: 'Опыт влияет на выбор подходящего специалиста'
    }
  ]
}

/**
 * Валидирует собранные персональные данные
 */
export function validatePersonalData(data: Partial<PersonalProfile>): {
  isValid: boolean
  missingFields: string[]
  warnings: string[]
} {
  const missingFields: string[] = []
  const warnings: string[] = []

  // Критичные поля
  if (!data.gender) missingFields.push('gender')
  if (!data.age) missingFields.push('age')

  // Предупреждения
  if (data.gender === 'male' && data.age === 'young') {
    warnings.push('Молодым мужчинам обычно больше подходят активные методы работы')
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  }
}
