/**
 * Error Boundary для компонентов главной страницы
 */

'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class HomepageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Homepage Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Что-то пошло не так
            </h3>
            <p className="text-muted-foreground mb-4">
              Произошла ошибка при загрузке страницы. Попробуйте обновить страницу.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Обновить страницу
            </button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
