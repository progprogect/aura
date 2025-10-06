/**
 * Хук для управления сессией чата
 * Сохраняет в localStorage и синхронизирует с backend
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { APP_CONFIG } from '@/config/app'
import type { Specialist } from '@/lib/ai/types'

const CURRENT_SESSION_KEY = 'aura_chat_session_current'
const SESSION_PREFIX = 'aura_chat_session_'
const SESSION_TTL = APP_CONFIG.cache.session

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  specialists?: (Specialist & {
    similarity?: number | null
    matchReasons?: string[]
  })[]
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
        const currentSessionId = localStorage.getItem(CURRENT_SESSION_KEY)

        if (currentSessionId) {
          const sessionKey = `${SESSION_PREFIX}${currentSessionId}`
          const stored = localStorage.getItem(sessionKey)

          if (stored) {
            const session: SessionData = JSON.parse(stored)

            // Проверяем TTL
            if (Date.now() - session.updatedAt < SESSION_TTL) {
              setSessionId(session.sessionId)
              setMessages(session.messages)
              console.log('[Session] Loaded existing session:', session.sessionId)
              return
            }
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

        const sessionKey = `${SESSION_PREFIX}${newSessionId}`
        localStorage.setItem(sessionKey, JSON.stringify(newSession))
        localStorage.setItem(CURRENT_SESSION_KEY, newSessionId)
        setSessionId(newSessionId)
        setMessages([])
        console.log('[Session] Created new session:', newSessionId)
      } catch (error) {
        console.error('[Session] Error loading session:', error)
        setSessionId(crypto.randomUUID())
      }
    }

    loadOrCreateSession()
  }, [])

  // Сохранение сообщения
  const saveMessage = useCallback(
    (message: ChatMessage) => {
      try {
        if (!sessionId) return
        
        const sessionKey = `${SESSION_PREFIX}${sessionId}`
        const stored = localStorage.getItem(sessionKey)
        if (!stored) return

        const session: SessionData = JSON.parse(stored)
        session.messages.push(message)
        session.updatedAt = Date.now()

        localStorage.setItem(sessionKey, JSON.stringify(session))
        setMessages(session.messages)
      } catch (error) {
        console.error('[Session] Error saving message:', error)
      }
    },
    [sessionId]
  )

  // Очистка сессии (создание новой)
  const clearSession = useCallback(() => {
    try {
      const newSessionId = crypto.randomUUID()
      const newSession: SessionData = {
        sessionId: newSessionId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      
      const sessionKey = `${SESSION_PREFIX}${newSessionId}`
      localStorage.setItem(sessionKey, JSON.stringify(newSession))
      localStorage.setItem(CURRENT_SESSION_KEY, newSessionId)
      setSessionId(newSessionId)
      setMessages([])
      console.log('[Session] Cleared and created new session:', newSessionId)
    } catch (error) {
      console.error('[Session] Error clearing session:', error)
    }
  }, [])
  
  // Загрузка существующей сессии
  const loadSession = useCallback((targetSessionId: string) => {
    try {
      const sessionKey = `${SESSION_PREFIX}${targetSessionId}`
      const stored = localStorage.getItem(sessionKey)
      
      if (stored) {
        const session: SessionData = JSON.parse(stored)
        setSessionId(session.sessionId)
        setMessages(session.messages)
        localStorage.setItem(CURRENT_SESSION_KEY, targetSessionId)
        console.log('[Session] Loaded session:', targetSessionId)
      }
    } catch (error) {
      console.error('[Session] Error loading session:', error)
    }
  }, [])

  // Получение истории
  const getHistory = useCallback((): ChatMessage[] => {
    try {
      if (!sessionId) return []
      const sessionKey = `${SESSION_PREFIX}${sessionId}`
      const stored = localStorage.getItem(sessionKey)
      if (!stored) return []
      const session: SessionData = JSON.parse(stored)
      return session.messages
    } catch (error) {
      console.error('[Session] Error getting history:', error)
      return []
    }
  }, [sessionId])

  return {
    sessionId,
    messages,
    saveMessage,
    clearSession,
    loadSession,
    getHistory,
  }
}

