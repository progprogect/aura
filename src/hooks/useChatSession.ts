/**
 * Хук для управления сессией чата
 * Сохраняет в localStorage и синхронизирует с backend
 */

'use client'

import { useEffect, useState, useCallback } from 'react'

const SESSION_KEY = 'aura_chat_session'
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000 // 7 дней

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  specialists?: any[]
  buttons?: string[]
  timestamp: number
  sessionId?: string
}

interface SessionData {
  sessionId: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // Инициализация: загрузка или создание сессии
  useEffect(() => {
    const loadOrCreateSession = () => {
      try {
        const stored = localStorage.getItem(SESSION_KEY)

        if (stored) {
          const session: SessionData = JSON.parse(stored)

          // Проверяем TTL
          if (Date.now() - session.updatedAt < SESSION_TTL) {
            setSessionId(session.sessionId)
            setMessages(session.messages)
            console.log('[Session] Loaded existing session:', session.sessionId)
            return
          } else {
            console.log('[Session] Session expired, creating new')
          }
        }

        // Создаём новую сессию
        const newSessionId = crypto.randomUUID()
        const newSession: SessionData = {
          sessionId: newSessionId,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
        setSessionId(newSessionId)
        setMessages([])
        console.log('[Session] Created new session:', newSessionId)
      } catch (error) {
        console.error('[Session] Error loading session:', error)
        // Fallback: создаём сессию без localStorage
        setSessionId(crypto.randomUUID())
      }
    }

    loadOrCreateSession()
  }, [])

  // Сохранение сообщения
  const saveMessage = useCallback(
    (message: ChatMessage) => {
      try {
        const stored = localStorage.getItem(SESSION_KEY)
        if (!stored) return

        const session: SessionData = JSON.parse(stored)
        session.messages.push(message)
        session.updatedAt = Date.now()

        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        setMessages(session.messages)
      } catch (error) {
        console.error('[Session] Error saving message:', error)
      }
    },
    []
  )

  // Очистка сессии
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY)
      const newSessionId = crypto.randomUUID()
      const newSession: SessionData = {
        sessionId: newSessionId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
      setSessionId(newSessionId)
      setMessages([])
      console.log('[Session] Cleared and created new session:', newSessionId)
    } catch (error) {
      console.error('[Session] Error clearing session:', error)
    }
  }, [])

  // Получение истории
  const getHistory = useCallback((): ChatMessage[] => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return []
      const session: SessionData = JSON.parse(stored)
      return session.messages
    } catch (error) {
      console.error('[Session] Error getting history:', error)
      return []
    }
  }, [])

  return {
    sessionId,
    messages,
    saveMessage,
    clearSession,
    getHistory,
  }
}

