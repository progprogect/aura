/**
 * Основной хук для работы с AI-чатом
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useChatSession, ChatMessage } from './useChatSession'
import type { Specialist } from '@/lib/ai/types'

export function useChat() {
  const { sessionId, messages: sessionMessages, saveMessage, clearSession, loadSession } = useChatSession()
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
          if (buffer.includes('__SPECIALISTS__')) {
            const startIdx = buffer.indexOf('__SPECIALISTS__')
            const jsonStart = startIdx + '__SPECIALISTS__'.length
            
            // Ищем полный JSON массив (считаем вложенность скобок)
            let bracketCount = 0
            let jsonEnd = -1
            let inString = false
            let escapeNext = false
            
            for (let i = jsonStart; i < buffer.length; i++) {
              const char = buffer[i]
              
              if (escapeNext) {
                escapeNext = false
                continue
              }
              
              if (char === '\\') {
                escapeNext = true
                continue
              }
              
              if (char === '"') {
                inString = !inString
                continue
              }
              
              if (!inString) {
                if (char === '[') bracketCount++
                if (char === ']') {
                  bracketCount--
                  if (bracketCount === 0) {
                    jsonEnd = i + 1
                    break
                  }
                }
              }
            }
            
            if (jsonEnd > jsonStart) {
              assistantContent += buffer.substring(0, startIdx)
              const jsonStr = buffer.substring(jsonStart, jsonEnd)
              buffer = buffer.substring(jsonEnd)
              
              try {
                specialists = JSON.parse(jsonStr)
                console.log('[Chat] ✅ Parsed specialists:', specialists.length, 'items')
              } catch (e) {
                console.error('[Chat] ❌ Failed to parse specialists:', e)
                console.error('[Chat] ❌ JSON string:', jsonStr.substring(0, 200) + '...')
              }
            }
          } else if (buffer.includes('__BUTTONS__')) {
            const startIdx = buffer.indexOf('__BUTTONS__')
            const jsonStart = startIdx + '__BUTTONS__'.length
            
            // Для buttons проще - ищем первую закрывающую ] (buttons - простой массив строк)
            const jsonEnd = buffer.indexOf(']', jsonStart)
            
            if (jsonEnd > jsonStart) {
              assistantContent += buffer.substring(0, startIdx)
              const jsonStr = buffer.substring(jsonStart, jsonEnd + 1)
              buffer = buffer.substring(jsonEnd + 1)
              
              try {
                buttons = JSON.parse(jsonStr)
                console.log('[Chat] ✅ Parsed buttons:', buttons.length, 'items')
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

        console.log('[Chat] 💾 Final message to save:', {
          hasSpecialists: !!finalMessage.specialists,
          specialistsCount: finalMessage.specialists?.length || 0,
          hasButtons: !!finalMessage.buttons,
          messageId: finalMessage.id,
        })

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

  // Отмена последнего сообщения (возврат назад)
  const undoLastMessage = useCallback(() => {
    if (messages.length < 2) return // Нельзя отменить если меньше 2 сообщений
    
    // Убираем последнее сообщение ассистента и последнее пользовательское
    const newMessages = messages.slice(0, -2)
    setMessages(newMessages)
    
    // Обновляем localStorage
    const stored = localStorage.getItem('aura_chat_session')
    if (stored) {
      const session = JSON.parse(stored)
      session.messages = newMessages
      session.updatedAt = Date.now()
      localStorage.setItem('aura_chat_session', JSON.stringify(session))
    }
  }, [messages])

  return {
    messages,
    sendMessage,
    isLoading,
    reset,
    undoLastMessage,
    loadSession,
    sessionId,
  }
}

