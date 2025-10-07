/**
 * Хук для управления сессией чата
 * Сохраняет в localStorage и синхронизирует с backend
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { APP_CONFIG } from '@/config/app'
import type { Specialist } from '@/lib/ai/types'
import type { StructuredQuestion, QuestionContext } from '@/lib/ai/question-generator'

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
  // Новые поля для структурированных данных
  questions?: StructuredQuestion[]
  collectedData?: Record<string, any>
  dataCollectionPhase?: 'collecting' | 'completed' | 'skipped'
}

interface SessionData {
  sessionId: string
  messages: ChatMessage[]
  // Структурированные данные сессии
  collectedData: Record<string, any>
  questionsAsked: StructuredQuestion[]
  currentPhase: 'initial' | 'collecting' | 'searching' | 'completed'
  detectedCategory?: string
  createdAt: number
  updatedAt: number
}

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [collectedData, setCollectedData] = useState<Record<string, any>>({})
  const [questionsAsked, setQuestionsAsked] = useState<StructuredQuestion[]>([])
  const [currentPhase, setCurrentPhase] = useState<'initial' | 'collecting' | 'searching' | 'completed'>('initial')
  const [detectedCategory, setDetectedCategory] = useState<string>()

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
              setCollectedData(session.collectedData || {})
              setQuestionsAsked(session.questionsAsked || [])
              setCurrentPhase(session.currentPhase || 'initial')
              setDetectedCategory(session.detectedCategory)
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
          collectedData: {},
          questionsAsked: [],
          currentPhase: 'initial',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        const sessionKey = `${SESSION_PREFIX}${newSessionId}`
        localStorage.setItem(sessionKey, JSON.stringify(newSession))
        localStorage.setItem(CURRENT_SESSION_KEY, newSessionId)
        setSessionId(newSessionId)
        setMessages([])
        setCollectedData({})
        setQuestionsAsked([])
        setCurrentPhase('initial')
        setDetectedCategory(undefined)
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

  // Сохранение собранных данных
  const saveCollectedData = useCallback(
    (data: Record<string, any>) => {
      try {
        if (!sessionId) return
        
        const sessionKey = `${SESSION_PREFIX}${sessionId}`
        const stored = localStorage.getItem(sessionKey)
        if (!stored) return

        const session: SessionData = JSON.parse(stored)
        session.collectedData = { ...session.collectedData, ...data }
        session.updatedAt = Date.now()

        localStorage.setItem(sessionKey, JSON.stringify(session))
        setCollectedData(session.collectedData)
      } catch (error) {
        console.error('[Session] Error saving collected data:', error)
      }
    },
    [sessionId]
  )

  // Сохранение заданных вопросов
  const saveQuestionsAsked = useCallback(
    (questions: StructuredQuestion[]) => {
      try {
        if (!sessionId) return
        
        const sessionKey = `${SESSION_PREFIX}${sessionId}`
        const stored = localStorage.getItem(sessionKey)
        if (!stored) return

        const session: SessionData = JSON.parse(stored)
        session.questionsAsked = questions
        session.updatedAt = Date.now()

        localStorage.setItem(sessionKey, JSON.stringify(session))
        setQuestionsAsked(questions)
      } catch (error) {
        console.error('[Session] Error saving questions:', error)
      }
    },
    [sessionId]
  )

  // Обновление фазы сессии
  const updatePhase = useCallback(
    (phase: 'initial' | 'collecting' | 'searching' | 'completed') => {
      try {
        if (!sessionId) return
        
        const sessionKey = `${SESSION_PREFIX}${sessionId}`
        const stored = localStorage.getItem(sessionKey)
        if (!stored) return

        const session: SessionData = JSON.parse(stored)
        session.currentPhase = phase
        session.updatedAt = Date.now()

        localStorage.setItem(sessionKey, JSON.stringify(session))
        setCurrentPhase(phase)
      } catch (error) {
        console.error('[Session] Error updating phase:', error)
      }
    },
    [sessionId]
  )

  // Обновление обнаруженной категории
  const updateDetectedCategory = useCallback(
    (category: string) => {
      try {
        if (!sessionId) return
        
        const sessionKey = `${SESSION_PREFIX}${sessionId}`
        const stored = localStorage.getItem(sessionKey)
        if (!stored) return

        const session: SessionData = JSON.parse(stored)
        session.detectedCategory = category
        session.updatedAt = Date.now()

        localStorage.setItem(sessionKey, JSON.stringify(session))
        setDetectedCategory(category)
      } catch (error) {
        console.error('[Session] Error updating category:', error)
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
        collectedData: {},
        questionsAsked: [],
        currentPhase: 'initial',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      
      const sessionKey = `${SESSION_PREFIX}${newSessionId}`
      localStorage.setItem(sessionKey, JSON.stringify(newSession))
      localStorage.setItem(CURRENT_SESSION_KEY, newSessionId)
      setSessionId(newSessionId)
      setMessages([])
      setCollectedData({})
      setQuestionsAsked([])
      setCurrentPhase('initial')
      setDetectedCategory(undefined)
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
        setCollectedData(session.collectedData || {})
        setQuestionsAsked(session.questionsAsked || [])
        setCurrentPhase(session.currentPhase || 'initial')
        setDetectedCategory(session.detectedCategory)
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

  // Получение контекста для генерации вопросов
  const getQuestionContext = useCallback((): QuestionContext => {
    return {
      userQuery: messages[messages.length - 1]?.content || '',
      detectedCategory: detectedCategory as any,
      collectedData,
      conversationHistory: messages.map(m => m.content)
    }
  }, [messages, detectedCategory, collectedData])

  return {
    sessionId,
    messages,
    collectedData,
    questionsAsked,
    currentPhase,
    detectedCategory,
    saveMessage,
    saveCollectedData,
    saveQuestionsAsked,
    updatePhase,
    updateDetectedCategory,
    clearSession,
    loadSession,
    getHistory,
    getQuestionContext,
  }
}

