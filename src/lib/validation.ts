/**
 * Validation - система валидации для AI-чата
 */

'use client'

import { z } from 'zod'
import { useCallback } from 'react'

// Схемы валидации для вопросов
export const QuestionOptionSchema = z.object({
  value: z.string().min(1, 'Значение не может быть пустым'),
  label: z.string().min(1, 'Метка не может быть пустой'),
  weight: z.number().min(0).max(10).optional(),
})

export const StructuredQuestionSchema = z.object({
  id: z.string().min(1, 'ID вопроса не может быть пустым'),
  question: z.string().min(5, 'Вопрос должен содержать минимум 5 символов'),
  type: z.enum(['single_choice', 'multiple_choice', 'text', 'skip']),
  options: z.array(QuestionOptionSchema).optional(),
  required: z.boolean(),
  category: z.string().min(1, 'Категория не может быть пустой'),
  order: z.number().min(0),
  helpText: z.string().optional(),
})

export const QuestionGenerationResultSchema = z.object({
  questions: z.array(StructuredQuestionSchema),
  shouldSearch: z.boolean(),
  searchParams: z.object({
    category: z.string().optional(),
    problem: z.string().min(1, 'Проблема не может быть пустой'),
    workFormats: z.array(z.string()),
    city: z.string().optional(),
    minExperience: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    preferences: z.record(z.string(), z.any()).optional(),
  }).optional(),
})

// Схемы валидации для поиска
export const SmartSearchOptionsSchema = z.object({
  query: z.string().min(1, 'Запрос не может быть пустым'),
  collectedData: z.record(z.string(), z.any()),
  detectedCategory: z.string().optional(),
  conversationHistory: z.array(z.string()),
  limit: z.number().min(1).max(50).default(10),
  excludeIds: z.array(z.string()).default([]),
})

export const PersonalizedRankingSchema = z.object({
  specialistId: z.string().min(1),
  score: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  matchFactors: z.object({
    categoryMatch: z.number().min(0).max(1),
    workFormatMatch: z.number().min(0).max(1),
    experienceMatch: z.number().min(0).max(1),
    priceMatch: z.number().min(0).max(1),
    preferenceMatch: z.number().min(0).max(1),
    semanticMatch: z.number().min(0).max(1),
  }),
})

// Схемы валидации для сообщений чата
export const ChatMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Содержимое сообщения не может быть пустым'),
  specialists: z.array(z.any()).optional(),
  buttons: z.array(z.string()).optional(),
  timestamp: z.number().min(0),
  sessionId: z.string().optional(),
  questions: z.array(StructuredQuestionSchema).optional(),
  collectedData: z.record(z.string(), z.any()).optional(),
  dataCollectionPhase: z.enum(['collecting', 'completed', 'skipped']).optional(),
})

// Схемы валидации для контекста
export const QuestionContextSchema = z.object({
  userQuery: z.string().min(1, 'Запрос пользователя не может быть пустым'),
  detectedCategory: z.string().optional(),
  collectedData: z.record(z.string(), z.any()),
  conversationHistory: z.array(z.string()),
})

export const AnalysisContextSchema = z.object({
  category: z.string().min(1),
  collectedData: z.record(z.string(), z.any()),
  questionsAsked: z.array(StructuredQuestionSchema),
  conversationHistory: z.array(z.string()),
  userQuery: z.string().min(1),
})

// Функции валидации
export function validateQuestionGenerationResult(data: unknown): {
  success: boolean
  data?: any
  error?: string
} {
  try {
    const result = QuestionGenerationResultSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Ошибка валидации: ${error.issues.map(e => e.message).join(', ')}` 
      }
    }
    return { success: false, error: 'Неизвестная ошибка валидации' }
  }
}

export function validateSmartSearchOptions(data: unknown): {
  success: boolean
  data?: any
  error?: string
} {
  try {
    const result = SmartSearchOptionsSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Ошибка валидации поиска: ${error.issues.map(e => e.message).join(', ')}` 
      }
    }
    return { success: false, error: 'Неизвестная ошибка валидации поиска' }
  }
}

export function validateChatMessage(data: unknown): {
  success: boolean
  data?: any
  error?: string
} {
  try {
    const result = ChatMessageSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Ошибка валидации сообщения: ${error.issues.map(e => e.message).join(', ')}` 
      }
    }
    return { success: false, error: 'Неизвестная ошибка валидации сообщения' }
  }
}

export function validateQuestionContext(data: unknown): {
  success: boolean
  data?: any
  error?: string
} {
  try {
    const result = QuestionContextSchema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Ошибка валидации контекста: ${error.issues.map(e => e.message).join(', ')}` 
      }
    }
    return { success: false, error: 'Неизвестная ошибка валидации контекста' }
  }
}

// Валидация пользовательского ввода
export function validateUserInput(input: string): {
  isValid: boolean
  sanitized?: string
  error?: string
} {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Ввод не может быть пустым' }
  }

  const trimmed = input.trim()
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Ввод не может быть пустым' }
  }

  if (trimmed.length > 10000) {
    return { isValid: false, error: 'Ввод слишком длинный (максимум 10000 символов)' }
  }

  // Проверяем на потенциально опасные символы
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return { isValid: false, error: 'Ввод содержит недопустимые символы' }
    }
  }

  return { isValid: true, sanitized: trimmed }
}

// Валидация ответов на вопросы
export function validateQuestionAnswer(
  questionId: string, 
  answer: string | string[], 
  question: any
): {
  isValid: boolean
  sanitized?: string | string[]
  error?: string
} {
  if (!questionId || typeof questionId !== 'string') {
    return { isValid: false, error: 'ID вопроса не может быть пустым' }
  }

  if (!question) {
    return { isValid: false, error: 'Вопрос не найден' }
  }

  // Валидируем в зависимости от типа вопроса
  if (question.type === 'single_choice') {
    if (typeof answer !== 'string') {
      return { isValid: false, error: 'Для вопроса с одним выбором нужен строковый ответ' }
    }

    const validOptions = question.options?.map((opt: any) => opt.value) || []
    if (!validOptions.includes(answer)) {
      return { isValid: false, error: 'Выбран недопустимый вариант ответа' }
    }

    return { isValid: true, sanitized: answer }
  }

  if (question.type === 'multiple_choice') {
    if (!Array.isArray(answer)) {
      return { isValid: false, error: 'Для вопроса с множественным выбором нужен массив ответов' }
    }

    const validOptions = question.options?.map((opt: any) => opt.value) || []
    const invalidAnswers = answer.filter(ans => !validOptions.includes(ans))
    
    if (invalidAnswers.length > 0) {
      return { isValid: false, error: 'Выбраны недопустимые варианты ответов' }
    }

    return { isValid: true, sanitized: answer }
  }

  if (question.type === 'text') {
    if (typeof answer !== 'string') {
      return { isValid: false, error: 'Для текстового вопроса нужен строковый ответ' }
    }

    const inputValidation = validateUserInput(answer)
    if (!inputValidation.isValid) {
      return { isValid: false, error: inputValidation.error }
    }

    return { isValid: true, sanitized: inputValidation.sanitized }
  }

  return { isValid: true, sanitized: answer }
}

// Хук для валидации
export function useValidation() {
  const validateInput = useCallback((input: string) => {
    return validateUserInput(input)
  }, [])

  const validateAnswer = useCallback((questionId: string, answer: string | string[], question: any) => {
    return validateQuestionAnswer(questionId, answer, question)
  }, [])

  const validateMessage = useCallback((message: any) => {
    return validateChatMessage(message)
  }, [])

  const validateSearchOptions = useCallback((options: any) => {
    return validateSmartSearchOptions(options)
  }, [])

  return {
    validateInput,
    validateAnswer,
    validateMessage,
    validateSearchOptions,
  }
}
