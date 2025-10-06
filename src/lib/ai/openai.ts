/**
 * OpenAI клиент и конфигурация
 */

import OpenAI from 'openai'
import { APP_CONFIG } from '@/config/app'

// Lazy initialization - создаём клиент только когда он нужен
let _openai: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables')
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return _openai
}

// Proxy для обратной совместимости (можно использовать как раньше: openai.chat.completions.create())
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getOpenAIClient()
    const value = client[prop as keyof OpenAI]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
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

