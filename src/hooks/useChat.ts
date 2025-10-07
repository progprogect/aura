/**
 * useChat - единый хук для AI-чата с поддержкой умного режима
 * Объединяет старую и новую логику в одном месте
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useChatSession, ChatMessage } from './useChatSession'
import { useErrorHandler } from '@/lib/error-handler'
import { useDebounce } from '@/lib/cache-manager'
import { useValidation } from '@/lib/validation'
import type { StructuredQuestion, QuestionGenerationResult } from '@/lib/ai/question-generator'
import type { Specialist } from '@/lib/ai/types'
import type { ChatError } from '@/lib/error-handler'

// API функции для вызова серверных модулей
async function callAIAPI(action: string, data: any) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
  })
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`)
  }
  
  return response.json()
}

export interface ChatMode {
  type: 'smart' | 'classic'
  enabled: boolean
}

export interface ChatState {
  mode: ChatMode
  phase: 'initial' | 'collecting' | 'searching' | 'completed'
  currentQuestions: StructuredQuestion[]
  isLoading: boolean
  error?: string
  isGeneratingQuestions: boolean
  isSearching: boolean
}

export function useChat() {
  const {
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
    getQuestionContext,
    clearSession,
    loadSession,
  } = useChatSession()

  const { handleError, recoverFromError, canRecover } = useErrorHandler()
  const { validateInput, validateAnswer, validateMessage, validateSearchOptions } = useValidation()

  const [state, setState] = useState<ChatState>({
    mode: { type: 'smart', enabled: true },
    phase: 'initial',
    currentQuestions: [],
    isLoading: false,
    isGeneratingQuestions: false,
    isSearching: false,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string>('')
  const debouncedMessage = useDebounce(pendingMessage, 500) // 500ms debounce

  // Синхронизируем состояние с сессией
  useEffect(() => {
    setState(prev => ({
      ...prev,
      phase: currentPhase,
      currentQuestions: questionsAsked,
    }))
  }, [currentPhase, questionsAsked])

  // Обработка сообщения
  const processMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !sessionId) return

      // Валидируем пользовательский ввод
      const inputValidation = validateInput(content)
      if (!inputValidation.isValid) {
        setState(prev => ({ 
          ...prev, 
          error: inputValidation.error || 'Некорректный ввод',
          isLoading: false 
        }))
        return
      }

      const sanitizedContent = inputValidation.sanitized!

      // Отменяем предыдущий запрос если есть
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      // Создаём сообщение пользователя
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: sanitizedContent,
        timestamp: Date.now(),
      }

      // Валидируем сообщение
      const messageValidation = validateMessage(userMessage)
      if (!messageValidation.success) {
        setState(prev => ({ 
          ...prev, 
          error: messageValidation.error || 'Ошибка валидации сообщения',
          isLoading: false 
        }))
        return
      }

      saveMessage(userMessage)
      setState(prev => ({ ...prev, isLoading: true, error: undefined }))

      try {
        if (state.mode.type === 'smart') {
          await handleSmartMode(userMessage)
        } else {
          await handleClassicMode(userMessage)
        }
      } catch (error) {
        const chatError = handleError(error, 'sendMessage')
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: chatError.message 
        }))
        
        // Пытаемся восстановиться
        if (canRecover(chatError)) {
          recoverFromError(chatError)
        }
      } finally {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    },
    [sessionId, saveMessage, state.mode.type, collectedData, detectedCategory, messages, handleError, canRecover, recoverFromError, validateInput, validateMessage]
  )

  // Обрабатываем debounced сообщение
  useEffect(() => {
    if (debouncedMessage && debouncedMessage.trim()) {
      processMessage(debouncedMessage)
      setPendingMessage('')
    }
  }, [debouncedMessage, processMessage])

  // Переключение режима чата
  const toggleMode = useCallback((mode: 'smart' | 'classic') => {
    setState(prev => ({
      ...prev,
      mode: { type: mode, enabled: true },
      phase: 'initial',
      error: undefined,
    }))
  }, [])

  // Отправка сообщения (единый метод для обоих режимов)
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !sessionId) return

      // Для быстрых ответов (кнопки) отправляем сразу
      if (state.phase === 'collecting' || state.phase === 'searching') {
        await processMessage(content)
        return
      }

      // Для обычных сообщений используем debouncing
      setPendingMessage(content)
    },
    [sessionId, state.phase]
  )

  // Обработка умного режима - используем реальный API
  const handleSmartMode = useCallback(async (userMessage: ChatMessage) => {
    try {
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
        signal: abortControllerRef.current?.signal,
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
      let buffer = ''
      let messageCreated = false

      while (true) {
        const { done, value } = (await reader?.read()) || {}
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // Парсим специальные маркеры
        if (buffer.includes('__SPECIALISTS__')) {
          const startIdx = buffer.indexOf('__SPECIALISTS__')
          const jsonStart = startIdx + '__SPECIALISTS__'.length
          
          let bracketCount = 0
          let jsonEnd = -1
          
          for (let i = jsonStart; i < buffer.length; i++) {
            if (buffer[i] === '[') bracketCount++
            if (buffer[i] === ']') bracketCount--
            if (bracketCount === 0) {
              jsonEnd = i
              break
            }
          }
          
          if (jsonEnd > jsonStart) {
            try {
              const specialistsJson = buffer.substring(jsonStart, jsonEnd + 1)
              specialists = JSON.parse(specialistsJson)
              buffer = buffer.substring(jsonEnd + 1)
            } catch (e) {
              console.error('[Chat] Failed to parse specialists:', e)
            }
          }
        }

        if (buffer.includes('__BUTTONS__')) {
          const startIdx = buffer.indexOf('__BUTTONS__')
          const jsonStart = startIdx + '__BUTTONS__'.length
          
          let bracketCount = 0
          let jsonEnd = -1
          
          for (let i = jsonStart; i < buffer.length; i++) {
            if (buffer[i] === '[') bracketCount++
            if (buffer[i] === ']') bracketCount--
            if (bracketCount === 0) {
              jsonEnd = i
              break
            }
          }
          
          if (jsonEnd > jsonStart) {
            try {
              const buttonsJson = buffer.substring(jsonStart, jsonEnd + 1)
              buttons = JSON.parse(buttonsJson)
              buffer = buffer.substring(jsonEnd + 1)
            } catch (e) {
              console.error('[Chat] Failed to parse buttons:', e)
            }
          }
        }

        // Добавляем текст к содержимому
        const textParts = buffer.split(/__(?:SPECIALISTS|BUTTONS)__/)
        if (textParts[0]) {
          assistantContent += textParts[0]
          buffer = buffer.substring(textParts[0].length)
        }

        // Создаем сообщение только один раз
        if (assistantContent && !messageCreated) {
          const assistantMessage: ChatMessage = {
            id: tempAssistantId,
            role: 'assistant',
            content: assistantContent,
            specialists: specialists.length > 0 ? specialists : undefined,
            buttons: buttons.length > 0 ? buttons : undefined,
            timestamp: Date.now(),
          }
          
          saveMessage(assistantMessage)
          messageCreated = true
        }
      }

      // Финальное обновление сообщения с полным содержимым
      if (assistantContent) {
        const finalMessage: ChatMessage = {
          id: tempAssistantId,
          role: 'assistant',
          content: assistantContent,
          specialists: specialists.length > 0 ? specialists : undefined,
          buttons: buttons.length > 0 ? buttons : undefined,
          timestamp: Date.now(),
        }
        
        // Обновляем последнее сообщение
        const sessionKey = `aura_chat_session_${sessionId}`
        const stored = localStorage.getItem(sessionKey)
        if (stored) {
          const session = JSON.parse(stored)
          const messageIndex = session.messages.findIndex((m: ChatMessage) => m.id === tempAssistantId)
          if (messageIndex >= 0) {
            session.messages[messageIndex] = finalMessage
            localStorage.setItem(sessionKey, JSON.stringify(session))
          }
        }
      }

    } catch (error) {
      const chatError = handleError(error, 'smartMode')
      console.error('[Chat] Smart mode error:', chatError)
      
      // Fallback к классическому режиму
      if (canRecover(chatError)) {
        recoverFromError(chatError)
        await handleClassicMode(userMessage)
      } else {
        throw chatError
      }
    }
  }, [messages, sessionId, saveMessage, handleError, canRecover, recoverFromError])

  // Обработка классического режима
  const handleClassicMode = useCallback(async (userMessage: ChatMessage) => {
    try {
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
        signal: abortControllerRef.current?.signal,
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
      let buffer = ''

      while (true) {
        const { done, value } = (await reader?.read()) || {}
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // Парсим специальные маркеры
        if (buffer.includes('__SPECIALISTS__')) {
          const startIdx = buffer.indexOf('__SPECIALISTS__')
          const jsonStart = startIdx + '__SPECIALISTS__'.length
          
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
            } catch (e) {
              console.error('[Chat] Failed to parse specialists:', e)
            }
          }
        } else if (buffer.includes('__BUTTONS__')) {
          const startIdx = buffer.indexOf('__BUTTONS__')
          const jsonStart = startIdx + '__BUTTONS__'.length
          const jsonEnd = buffer.indexOf(']', jsonStart)
          
          if (jsonEnd > jsonStart) {
            assistantContent += buffer.substring(0, startIdx)
            const jsonStr = buffer.substring(jsonStart, jsonEnd + 1)
            buffer = buffer.substring(jsonEnd + 1)
            
            try {
              buttons = JSON.parse(jsonStr)
            } catch (e) {
              console.error('[Chat] Failed to parse buttons:', e)
            }
          }
        } else if (!buffer.includes('__')) {
          assistantContent += buffer
          buffer = ''
        }

        // Обновляем сообщение в реальном времени
        const cleanContent = assistantContent
          .replace(/__BUTTONS__\[.*?\]/g, '')
          .replace(/__SEARCH__\{.*?\}/g, '')
          .trim()

        // Обновляем состояние для streaming
        setState(prev => ({
          ...prev,
          isLoading: true, // Продолжаем показывать индикатор загрузки
        }))
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
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      
      const chatError = handleError(error, 'classicMode')
      throw chatError
    }
  }, [messages, sessionId, saveMessage, handleError])

  // Обработка ответов на вопросы
  const handleQuestionAnswer = useCallback(async (questionId: string, answer: string | string[]) => {
    try {
      // Находим вопрос
      const question = questionsAsked.find(q => q.id === questionId)
      if (!question) {
        setState(prev => ({ 
          ...prev, 
          error: 'Вопрос не найден' 
        }))
        return
      }

      // Валидируем ответ
      const answerValidation = validateAnswer(questionId, answer, question)
      if (!answerValidation.isValid) {
        setState(prev => ({ 
          ...prev, 
          error: answerValidation.error || 'Некорректный ответ' 
        }))
        return
      }

      const sanitizedAnswer = answerValidation.sanitized!

      // Сохраняем ответ
      const newData = { [questionId]: sanitizedAnswer }
      saveCollectedData(newData)

      // Создаем сообщение пользователя
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: Array.isArray(sanitizedAnswer) ? sanitizedAnswer.join(', ') : sanitizedAnswer,
        timestamp: Date.now(),
      }
      saveMessage(userMessage)

      // Анализируем достаточность данных
      const context = {
        category: detectedCategory as any,
        collectedData: { ...collectedData, ...newData },
        questionsAsked: questionsAsked,
        conversationHistory: messages.map(m => m.content),
        userQuery: messages[messages.length - 1]?.content || ''
      }

      const sufficiency = await callAIAPI('analyzeDataSufficiency', context)

      if (sufficiency.isSufficient || !sufficiency.shouldAskMore) {
        // Переходим к поиску
        await performSearch({
          category: detectedCategory as any,
          problem: context.userQuery,
          workFormats: newData.work_format ? [newData.work_format] : [],
          preferences: newData
        })
      } else {
        // Продолжаем сбор данных
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Спасибо! Ещё один вопрос для более точного подбора.`,
          timestamp: Date.now(),
        }
        saveMessage(assistantMessage)
      }

    } catch (error) {
      const chatError = handleError(error, 'questionAnswer')
      console.error('[Chat] Error handling question answer:', chatError)
      setState(prev => ({ 
        ...prev, 
        error: chatError.message 
      }))
    }
  }, [collectedData, detectedCategory, questionsAsked, messages, saveCollectedData, saveMessage, validateAnswer, handleError])

  // Выполнение поиска специалистов
  const performSearch = useCallback(async (searchParams: any) => {
    try {
      setState(prev => ({ ...prev, isSearching: true }))
      updatePhase('searching')

      const searchOptions = {
        query: searchParams.problem || messages[messages.length - 1]?.content || '',
        collectedData,
        detectedCategory,
        conversationHistory: messages.map(m => m.content),
        limit: 6,
        excludeIds: []
      }

      // Валидируем параметры поиска
      const searchValidation = validateSearchOptions(searchOptions)
      if (!searchValidation.success) {
        setState(prev => ({ 
          ...prev, 
          error: searchValidation.error || 'Ошибка валидации параметров поиска',
          isSearching: false
        }))
        return
      }

      const searchResult = await callAIAPI('smartSearch', searchOptions)

      // Создаем сообщение с результатами
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Подобрал ${searchResult.specialists.length} специалистов на основе ваших предпочтений. Посмотрите карточки выше!`,
        specialists: searchResult.specialists,
        buttons: ['Подходят', 'Показать других', 'Уточнить критерии'],
        timestamp: Date.now(),
      }

      saveMessage(assistantMessage)
      updatePhase('completed')

    } catch (error) {
      const chatError = handleError(error, 'search')
      console.error('[Chat] Error performing search:', chatError)
      setState(prev => ({ 
        ...prev, 
        error: chatError.message,
        isSearching: false
      }))
    } finally {
      setState(prev => ({ ...prev, isSearching: false }))
    }
  }, [collectedData, detectedCategory, messages, updatePhase, saveMessage, handleError, validateSearchOptions])

  // Пропуск сбора данных
  const skipDataCollection = useCallback(async () => {
    try {
      const context = getQuestionContext()
      await performSearch({
        category: detectedCategory,
        problem: context.userQuery,
        workFormats: [],
        preferences: collectedData
      })
    } catch (error) {
      const chatError = handleError(error, 'skipDataCollection')
      console.error('[Chat] Error skipping data collection:', chatError)
    }
  }, [getQuestionContext, detectedCategory, collectedData, performSearch, handleError])

  // Сброс чата
  const reset = useCallback(() => {
    setState({
      mode: { type: 'smart', enabled: true },
      phase: 'initial',
      currentQuestions: [],
      isLoading: false,
      isGeneratingQuestions: false,
      isSearching: false,
      error: undefined,
    })
    clearSession()
  }, [clearSession])

  // Отмена последнего сообщения
  const undoLastMessage = useCallback(() => {
    if (messages.length < 2) return
    
    const newMessages = messages.slice(0, -2)
    setState(prev => ({ ...prev, phase: 'initial' }))
    
    // Обновляем localStorage
    const stored = localStorage.getItem(`aura_chat_session_${sessionId}`)
    if (stored) {
      const session = JSON.parse(stored)
      session.messages = newMessages
      session.updatedAt = Date.now()
      localStorage.setItem(`aura_chat_session_${sessionId}`, JSON.stringify(session))
    }
  }, [messages, sessionId])

  return {
    // Состояние
    messages,
    state,
    sessionId,
    isLoading: state.isLoading,
    
    // Методы
    sendMessage,
    handleQuestionAnswer,
    skipDataCollection,
    toggleMode,
    reset,
    undoLastMessage,
    loadSession,
  }
}