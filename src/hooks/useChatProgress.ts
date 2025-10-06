/**
 * Хук для отслеживания прогресса диалога
 */

'use client'

import { useMemo } from 'react'
import type { ChatMessage } from './useChatSession'

export function useChatProgress(messages: ChatMessage[]) {
  const currentStep = useMemo(() => {
    if (messages.length === 0) return 1 // Начало

    // Проверяем, были ли показаны специалисты
    const hasSpecialists = messages.some((m) => m.specialists && m.specialists.length > 0)
    if (hasSpecialists) return 5 // Готово

    // Определяем шаг на основе контента сообщений
    const userMessages = messages.filter((m) => m.role === 'user')
    const assistantMessages = messages.filter((m) => m.role === 'assistant')

    // Шаг 1: Первое сообщение пользователя (описание проблемы)
    if (userMessages.length === 1 && assistantMessages.length <= 1) return 1

    // Шаг 2: GPT спрашивает формат (после первого ответа GPT)
    const formatKeywords = ['формат', 'онлайн', 'оффлайн', 'неважно']
    const hasFormatQuestion = assistantMessages.some((m) =>
      formatKeywords.some((kw) => m.content.toLowerCase().includes(kw))
    )
    if (hasFormatQuestion && userMessages.length <= 2) return 2

    // Шаг 3: Уточнение деталей (после 2-го ответа пользователя)
    if (userMessages.length >= 2 && userMessages.length <= 3 && !hasSpecialists) return 3

    // Шаг 4: Подбор (поиск специалистов начался)
    if (userMessages.length >= 3 || assistantMessages.some(m => 
      m.content.toLowerCase().includes('подбираю') || 
      m.content.toLowerCase().includes('найд') ||
      m.content.toLowerCase().includes('специалист')
    )) return 4

    return 1
  }, [messages])

  return { currentStep }
}

