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
    if (userMessages.length === 1) return 1

    // Шаг 2: GPT спрашивает формат
    const formatKeywords = ['формат', 'онлайн', 'оффлайн', 'неважно']
    const hasFormatQuestion = assistantMessages.some((m) =>
      formatKeywords.some((kw) => m.content.toLowerCase().includes(kw))
    )
    if (hasFormatQuestion && userMessages.length === 2) return 2

    // Шаг 3: Уточнение деталей
    if (userMessages.length >= 3 && userMessages.length < 4) return 3

    // Шаг 4: Подбор (поиск специалистов)
    if (userMessages.length >= 4) return 4

    return 1
  }, [messages])

  return { currentStep }
}

