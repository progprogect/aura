/**
 * OpenAI клиент и конфигурация
 */

import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Модели
export const MODELS = {
  CHAT: 'gpt-4o-mini', // Быстрая и дешёвая модель для чата
  EMBEDDING: 'text-embedding-3-small', // 1536 dimensions
} as const

// Параметры для чата
export const CHAT_CONFIG = {
  temperature: 0.7, // Баланс между креативностью и последовательностью
  maxTokens: 500, // Ограничение ответа (короткие сообщения)
  topP: 0.9,
} as const

