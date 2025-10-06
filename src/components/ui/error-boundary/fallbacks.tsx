/**
 * Fallback UI для разных типов ошибок
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import type { ErrorFallbackProps } from './ErrorBoundary'

/**
 * Fallback для чата (полноэкранный)
 */
export function ChatErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Что-то пошло не так</h2>
          <p className="text-muted-foreground mb-4">
            Произошла ошибка при загрузке чата. Попробуйте обновить страницу.
          </p>
          {error && process.env.NODE_ENV === 'development' && (
            <pre className="text-xs text-left bg-muted p-4 rounded-lg overflow-auto max-h-40">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Попробовать снова
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            <Home className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Fallback для главной страницы (компактный)
 */
export function HomepageErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Что-то пошло не так</h3>
        <p className="text-muted-foreground mb-4">
          Произошла ошибка при загрузке секции. Попробуйте обновить страницу.
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Детали ошибки
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}
        <Button onClick={() => window.location.reload()} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Обновить страницу
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Fallback по умолчанию (универсальный)
 */
export function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Произошла ошибка
                </h3>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Что-то пошло не так. Попробуйте обновить страницу или вернуться на главную.
            </p>

            {error && process.env.NODE_ENV === 'development' && (
              <details className="mb-4">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Детали ошибки (только в dev)
                </summary>
                <pre className="mt-2 text-xs text-destructive bg-destructive/10 p-3 rounded overflow-auto max-h-40">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <Button onClick={reset} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Обновить страницу
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

