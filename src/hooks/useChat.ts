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
  const processMessageRef = useRef<typeof processMessage>()
  const handleSmartModeRef = useRef<typeof handleSmartMode>()
  const handleClassicModeRef = useRef<typeof handleClassicMode>()
  const handleQuestionAnswerRef = useRef<typeof handleQuestionAnswer>()
  const performSearchRef = useRef<typeof performSearch>()
  // undoLastMessageRef удалён
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

  // Обработка сообщения - стабильная функция без зависимостей от изменяемых данных
  const processMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !sessionId) return

      // Получаем актуальные данные на момент вызова
      const currentMessages = messages
      const currentCollectedData = collectedData
      const currentDetectedCategory = detectedCategory
      const currentMode = state.mode.type

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
        if (currentMode === 'smart') {
          await handleSmartModeRef.current?.(userMessage, currentMessages, currentCollectedData, currentDetectedCategory)
        } else {
          await handleClassicModeRef.current?.(userMessage, currentMessages)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId, saveMessage, handleError, canRecover, recoverFromError, validateInput, validateMessage]
  )

  // Обрабатываем debounced сообщение
  useEffect(() => {
    if (debouncedMessage && debouncedMessage.trim()) {
      processMessageRef.current?.(debouncedMessage)
      setPendingMessage('')
    }
  }, [debouncedMessage])

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
        await processMessageRef.current?.(content)
        return
      }

      // Для обычных сообщений используем debouncing
      setPendingMessage(content)
    },
    [sessionId, state.phase]
  )

  // Обработка умного режима - стабильная функция с параметрами
  const handleSmartMode = useCallback(async (
    userMessage: ChatMessage, 
    currentMessages: ChatMessage[], 
    currentCollectedData: Record<string, any>, 
    currentDetectedCategory?: string
  ) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...currentMessages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionId,
          collectedData: currentCollectedData,
          detectedCategory: currentDetectedCategory,
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
            try {
              const specialistsJson = buffer.substring(jsonStart, jsonEnd)
              specialists = JSON.parse(specialistsJson)
              buffer = buffer.substring(jsonEnd)
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
            try {
              const buttonsJson = buffer.substring(jsonStart, jsonEnd)
              buttons = JSON.parse(buttonsJson)
              buffer = buffer.substring(jsonEnd)
            } catch (e) {
              console.error('[Chat] Failed to parse buttons:', e)
            }
          }
        }

        // Добавляем текст к содержимому (очищаем от маркеров)
        const textParts = buffer.split(/__(?:SPECIALISTS|BUTTONS)__/)
        if (textParts[0]) {
          assistantContent += textParts[0]
            .replace(/__BUTTONS__\[.*?\]/g, '')
            .replace(/__SPECIALISTS__\[.*?\]/g, '')
          buffer = buffer.substring(textParts[0].length)
        }

        // Накапливаем содержимое для финального сообщения
      }

      // Сохраняем финальное сообщение
      if (assistantContent) {
        const finalMessage: ChatMessage = {
          id: tempAssistantId,
          role: 'assistant',
          content: assistantContent
            .replace(/__BUTTONS__\[.*?\]/g, '')
            .replace(/__SPECIALISTS__\[.*?\]/g, '')
            .trim(),
          specialists: specialists.length > 0 ? specialists : undefined,
          buttons: buttons.length > 0 ? buttons : undefined,
          timestamp: Date.now(),
        }
        
        saveMessage(finalMessage)
      }

    } catch (error) {
      const chatError = handleError(error, 'smartMode')
      console.error('[Chat] Smart mode error:', chatError)
      
      // Fallback к классическому режиму
      if (canRecover(chatError)) {
        recoverFromError(chatError)
        await handleClassicModeRef.current?.(userMessage, currentMessages)
      } else {
        throw chatError
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, saveMessage, handleError, canRecover, recoverFromError])

  // Обработка классического режима - стабильная функция с параметрами
  const handleClassicMode = useCallback(async (userMessage: ChatMessage, currentMessages: ChatMessage[]) => {
    try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...currentMessages, userMessage].map((m) => ({
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
  }, [sessionId, saveMessage, handleError])

  // Обработка ответов на вопросы - стабильная функция с параметрами
  const handleQuestionAnswer = useCallback(async (
    questionId: string, 
    answer: string | string[],
    currentQuestionsAsked: StructuredQuestion[],
    currentCollectedData: Record<string, any>,
    currentDetectedCategory?: string,
    currentMessages: ChatMessage[] = []
  ) => {
    try {
      // Находим вопрос
      const question = currentQuestionsAsked.find(q => q.id === questionId)
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
        category: currentDetectedCategory as any,
        collectedData: { ...currentCollectedData, ...newData },
        questionsAsked: currentQuestionsAsked,
        conversationHistory: currentMessages.map(m => m.content),
        userQuery: currentMessages[currentMessages.length - 1]?.content || ''
      }

      const sufficiency = await callAIAPI('analyzeDataSufficiency', context)

      if (sufficiency.isSufficient || !sufficiency.shouldAskMore) {
        // Переходим к поиску
        await performSearchRef.current?.({
          category: currentDetectedCategory as any,
          problem: context.userQuery,
          workFormats: newData.work_format ? [newData.work_format] : [],
          preferences: { ...currentCollectedData, ...newData }
        }, { ...currentCollectedData, ...newData }, currentDetectedCategory, currentMessages)
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
  }, [saveCollectedData, saveMessage, validateAnswer, handleError])

  // Выполнение поиска специалистов - стабильная функция с параметрами
  const performSearch = useCallback(async (
    searchParams: any,
    currentCollectedData: Record<string, any>,
    currentDetectedCategory?: string,
    currentMessages: ChatMessage[] = []
  ) => {
    try {
      setState(prev => ({ ...prev, isSearching: true }))
      updatePhase('searching')

      const searchOptions = {
        query: searchParams.problem || currentMessages[currentMessages.length - 1]?.content || '',
        collectedData: currentCollectedData,
        detectedCategory: currentDetectedCategory,
        conversationHistory: currentMessages.map(m => m.content),
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
  }, [updatePhase, saveMessage, handleError, validateSearchOptions])

  // Пропуск сбора данных - стабильная функция с параметрами
  const skipDataCollection = useCallback(async (
    currentDetectedCategory?: string,
    currentCollectedData: Record<string, any> = {},
    currentMessages: ChatMessage[] = []
  ) => {
    try {
      const context = getQuestionContext()
      await performSearchRef.current?.({
        category: currentDetectedCategory,
        problem: context.userQuery,
        workFormats: [],
        preferences: currentCollectedData
      }, currentCollectedData, currentDetectedCategory, currentMessages)
    } catch (error) {
      const chatError = handleError(error, 'skipDataCollection')
      console.error('[Chat] Error skipping data collection:', chatError)
    }
  }, [getQuestionContext, handleError])

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

  // Функция undoLastMessage удалена - больше не используется

  // Обновляем ref'ы для стабильных ссылок
  processMessageRef.current = processMessage
  handleSmartModeRef.current = handleSmartMode
  handleClassicModeRef.current = handleClassicMode
  handleQuestionAnswerRef.current = handleQuestionAnswer
  performSearchRef.current = performSearch
  // undoLastMessageRef.current удалён

  // Обертка для handleQuestionAnswer с правильной сигнатурой
  const handleQuestionAnswerWrapper = useCallback(async (questionId: string, answer: string | string[]) => {
    return handleQuestionAnswerRef.current?.(questionId, answer, questionsAsked, collectedData, detectedCategory, messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    // Состояние
    messages,
    state,
    sessionId,
    isLoading: state.isLoading,
    
    // Методы
    sendMessage,
    handleQuestionAnswer: handleQuestionAnswerWrapper,
    skipDataCollection,
    toggleMode,
    reset,
    // undoLastMessage удалён
    loadSession,
  }
}