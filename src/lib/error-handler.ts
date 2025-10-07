/**
 * ErrorHandler - централизованная система обработки ошибок для AI-чата
 */

'use client'

import { useCallback } from 'react'

export interface ChatError {
  code: string
  message: string
  details?: any
  recoverable: boolean
  fallbackAction?: () => void
}

export interface ChatErrorLogEntry extends ChatError {
  timestamp: string
}

export class ChatErrorHandler {
  private static instance: ChatErrorHandler
  private errorLog: ChatErrorLogEntry[] = []

  static getInstance(): ChatErrorHandler {
    if (!ChatErrorHandler.instance) {
      ChatErrorHandler.instance = new ChatErrorHandler()
    }
    return ChatErrorHandler.instance
  }

  /**
   * Обрабатывает ошибки OpenAI API
   */
  handleOpenAIError(error: any): ChatError {
    console.error('[ErrorHandler] OpenAI error:', error)

    if (error.code === 'rate_limit_exceeded') {
      return {
        code: 'RATE_LIMIT',
        message: 'Превышен лимит запросов. Попробуйте через минуту.',
        details: error,
        recoverable: true,
        fallbackAction: () => {
          // Переключиться на классический режим
          console.log('[ErrorHandler] Switching to classic mode due to rate limit')
        }
      }
    }

    if (error.code === 'insufficient_quota') {
      return {
        code: 'QUOTA_EXCEEDED',
        message: 'Исчерпан лимит API. Обратитесь к администратору.',
        details: error,
        recoverable: false
      }
    }

    if (error.code === 'invalid_api_key') {
      return {
        code: 'INVALID_API_KEY',
        message: 'Неверный API ключ. Обратитесь к администратору.',
        details: error,
        recoverable: false
      }
    }

    // Общие ошибки OpenAI
    return {
      code: 'OPENAI_ERROR',
      message: 'Ошибка AI-сервиса. Попробуйте ещё раз.',
      details: error,
      recoverable: true,
      fallbackAction: () => {
        console.log('[ErrorHandler] Falling back to classic mode')
      }
    }
  }

  /**
   * Обрабатывает ошибки сети
   */
  handleNetworkError(error: any): ChatError {
    console.error('[ErrorHandler] Network error:', error)

    if (error.name === 'AbortError') {
      return {
        code: 'REQUEST_ABORTED',
        message: 'Запрос отменён',
        details: error,
        recoverable: true
      }
    }

    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Проблемы с интернетом. Проверьте соединение.',
        details: error,
        recoverable: true
      }
    }

    return {
      code: 'NETWORK_ERROR',
      message: 'Ошибка сети. Попробуйте ещё раз.',
      details: error,
      recoverable: true
    }
  }

  /**
   * Обрабатывает ошибки парсинга JSON
   */
  handleParseError(error: any, context: string): ChatError {
    console.error(`[ErrorHandler] Parse error in ${context}:`, error)

    return {
      code: 'PARSE_ERROR',
      message: `Ошибка обработки ответа от ${context}. Попробуйте ещё раз.`,
      details: error,
      recoverable: true,
      fallbackAction: () => {
        console.log(`[ErrorHandler] Using fallback for ${context}`)
      }
    }
  }

  /**
   * Обрабатывает ошибки валидации
   */
  handleValidationError(error: any, field: string): ChatError {
    console.error(`[ErrorHandler] Validation error for ${field}:`, error)

    return {
      code: 'VALIDATION_ERROR',
      message: `Некорректные данные в поле ${field}`,
      details: error,
      recoverable: true
    }
  }

  /**
   * Обрабатывает ошибки базы данных
   */
  handleDatabaseError(error: any): ChatError {
    console.error('[ErrorHandler] Database error:', error)

    return {
      code: 'DATABASE_ERROR',
      message: 'Ошибка базы данных. Попробуйте ещё раз.',
      details: error,
      recoverable: true
    }
  }

  /**
   * Логирует ошибку
   */
  logError(error: ChatError): void {
    this.errorLog.push({
      ...error,
      timestamp: new Date().toISOString()
    })

    // Ограничиваем размер лога
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50)
    }

    console.error('[ErrorHandler] Logged error:', error)
  }

  /**
   * Получает последние ошибки
   */
  getRecentErrors(limit: number = 10): ChatError[] {
    return this.errorLog.slice(-limit)
  }

  /**
   * Очищает лог ошибок
   */
  clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * Проверяет, можно ли восстановиться после ошибки
   */
  canRecover(error: ChatError): boolean {
    return error.recoverable && !!error.fallbackAction
  }

  /**
   * Выполняет восстановление после ошибки
   */
  recover(error: ChatError): void {
    if (this.canRecover(error) && error.fallbackAction) {
      try {
        error.fallbackAction()
        console.log('[ErrorHandler] Recovery action executed')
      } catch (recoveryError) {
        console.error('[ErrorHandler] Recovery failed:', recoveryError)
      }
    }
  }
}

/**
 * Хук для использования системы обработки ошибок
 */
export function useErrorHandler() {
  const errorHandler = ChatErrorHandler.getInstance()

  const handleError = useCallback((error: any, context?: string): ChatError => {
    let chatError: ChatError

    // Определяем тип ошибки
    if (error.code && error.code.startsWith('openai_')) {
      chatError = errorHandler.handleOpenAIError(error)
    } else if (error.name === 'AbortError' || error.code === 'NETWORK_ERROR') {
      chatError = errorHandler.handleNetworkError(error)
    } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
      chatError = errorHandler.handleParseError(error, context || 'unknown')
    } else if (error.name === 'ValidationError') {
      chatError = errorHandler.handleValidationError(error, context || 'unknown')
    } else {
      // Общая ошибка
      chatError = {
        code: 'UNKNOWN_ERROR',
        message: 'Произошла неожиданная ошибка. Попробуйте ещё раз.',
        details: error,
        recoverable: true
      }
    }

    // Логируем ошибку
    errorHandler.logError(chatError)

    return chatError
  }, [errorHandler])

  const recoverFromError = useCallback((error: ChatError) => {
    errorHandler.recover(error)
  }, [errorHandler])

  const getRecentErrors = useCallback((limit?: number) => {
    return errorHandler.getRecentErrors(limit)
  }, [errorHandler])

  return {
    handleError,
    recoverFromError,
    getRecentErrors,
    canRecover: errorHandler.canRecover.bind(errorHandler)
  }
}
