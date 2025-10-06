/**
 * OpenAI клиент и конфигурация
 */

import OpenAI from 'openai'
import { APP_CONFIG } from '@/config/app'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Модели (из централизованной конфигурации)
export const MODELS = {
  CHAT: APP_CONFIG.ai.models.chat,
  EMBEDDING: APP_CONFIG.ai.models.embedding,
} as const

// Параметры для чата (из централизованной конфигурации)
export const CHAT_CONFIG = {
  temperature: APP_CONFIG.ai.chat.temperature,
  maxTokens: APP_CONFIG.ai.chat.maxTokens,
  topP: APP_CONFIG.ai.chat.topP,
} as const

