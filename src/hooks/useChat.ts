/**
 * Основной хук для работы с AI-чатом
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useChatSession, ChatMessage } from './useChatSession'
import type { Specialist } from '@/lib/ai/types'

export function useChat() {
  const { sessionId, messages: sessionMessages, saveMessage, clearSession } = useChatSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Загружаем историю при инициализации
  useEffect(() => {
    if (sessionMessages.length > 0) {
      setMessages(sessionMessages)
    }
  }, [sessionMessages])

  // Отправка сообщения
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !sessionId) return

      // Отменяем предыдущий запрос если есть
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      // Создаём сообщение пользователя
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])
      saveMessage(userMessage)
      setIsLoading(true)

      try {
        // Отправляем запрос к API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            sessionId,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        // Читаем streaming response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        let assistantContent = ''
        let specialists: Specialist[] = []
        let buttons: string[] = []
        let tempAssistantId = crypto.randomUUID()
        let buffer = '' // Buffer для accumulation markers

        while (true) {
          const { done, value } = (await reader?.read()) || {}
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Проверяем на специальные маркеры в buffer
          if (buffer.includes('__SPECIALISTS__') && buffer.includes(']')) {
            const match = buffer.match(/__SPECIALISTS__([\s\S]*?\])/)
            if (match) {
              assistantContent += buffer.split('__SPECIALISTS__')[0]
              buffer = buffer.substring(buffer.indexOf(match[0]) + match[0].length)
              try {
                specialists = JSON.parse(match[1])
                console.log('[Chat] ✅ Parsed specialists:', specialists.length)
              } catch (e) {
                console.error('[Chat] ❌ Failed to parse specialists:', e, match[1])
              }
            }
          } else if (buffer.includes('__BUTTONS__') && buffer.includes(']')) {
            const match = buffer.match(/__BUTTONS__([\s\S]*?\])/)
            if (match) {
              assistantContent += buffer.split('__BUTTONS__')[0]
              buffer = buffer.substring(buffer.indexOf(match[0]) + match[0].length)
              try {
                buttons = JSON.parse(match[1])
                console.log('[Chat] ✅ Parsed buttons:', buttons.length)
              } catch (e) {
                console.error('[Chat] ❌ Failed to parse buttons:', e)
              }
            }
          } else if (!buffer.includes('__')) {
            // Если нет маркеров, добавляем к контенту
            assistantContent += buffer
            buffer = ''
          }

          // Убираем маркеры из текста
          const cleanContent = assistantContent
            .replace(/__BUTTONS__\[.*?\]/g, '')
            .replace(/__SEARCH__\{.*?\}/g, '')
            .trim()

          // Обновляем сообщение в реальном времени (streaming)
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1]
            if (lastMsg?.id === tempAssistantId && lastMsg.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMsg,
                  content: cleanContent,
                  specialists: specialists.length > 0 ? specialists : lastMsg.specialists,
                  buttons: buttons.length > 0 ? buttons : lastMsg.buttons,
                },
              ]
            } else {
              return [
                ...prev,
                {
                  id: tempAssistantId,
                  role: 'assistant' as const,
                  content: cleanContent,
                  specialists: specialists.length > 0 ? specialists : undefined,
                  buttons: buttons.length > 0 ? buttons : undefined,
                  timestamp: Date.now(),
                },
              ]
            }
          })
        }

        // Сохраняем финальное сообщение
        const finalMessage: ChatMessage = {
          id: tempAssistantId,
          role: 'assistant',
          content: assistantContent
            .replace(/__BUTTONS__\[.*?\]/g, '')
            .replace(/__SEARCH__\{.*?\}/g, '')
            .trim(),
          specialists: specialists.length > 0 ? specialists : undefined,
          buttons: buttons.length > 0 ? buttons : undefined,
          timestamp: Date.now(),
          sessionId: sessionId,
        }

        saveMessage(finalMessage)
      } catch (error) {
        // Игнорируем ошибку отмены
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        console.error('[Chat] Error:', error)

        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            'Извините, произошла ошибка. Попробуйте ещё раз или перейдите в каталог специалистов.',
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, errorMessage])
        saveMessage(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [messages, sessionId, saveMessage]
  )

  // Сброс чата
  const reset = useCallback(() => {
    setMessages([])
    clearSession()
  }, [clearSession])

  return {
    messages,
    sendMessage,
    isLoading,
    reset,
    sessionId,
  }
}

