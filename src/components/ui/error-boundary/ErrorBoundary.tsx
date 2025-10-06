/**
 * Унифицированный Error Boundary
 * Используется во всём приложении с разными fallback UI
 */

'use client'

import { Component, ReactNode } from 'react'

export interface ErrorFallbackProps {
  error?: Error
  reset: () => void
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (props: ErrorFallbackProps) => ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary компонент
 * Предотвращает полный крах приложения при ошибках
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)

    // Логирование через callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // В production можно отправлять в Sentry/LogRocket
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry.captureException(error)
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.reset })
      }
      return null // Нет fallback - ничего не показываем
    }

    return this.props.children
  }
}

