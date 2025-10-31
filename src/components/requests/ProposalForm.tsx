/**
 * Форма создания отклика на заявку
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'

interface ProposalFormProps {
  requestId: string
  requestBudget?: number | null
  onSuccess: () => void
  onCancel: () => void
}

export function ProposalForm({ requestId, requestBudget, onSuccess, onCancel }: ProposalFormProps) {
  const [message, setMessage] = useState('')
  const [proposedPrice, setProposedPrice] = useState(requestBudget ? String(requestBudget) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (message.trim().length < 50) {
      setError('Сообщение должно быть минимум 50 символов')
      return
    }

    const price = parseInt(proposedPrice)
    if (!price || price < 50 || price > 2000) {
      setError('Цена должна быть от 50 до 2000 баллов')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/requests/${requestId}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          proposedPrice: price
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Ошибка при создании отклика')
      }
    } catch (error) {
      setError('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="message">Ваше сообщение</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Расскажите, почему вы подходите для этой заявки..."
          rows={5}
          maxLength={1000}
          className="mt-2 resize-none"
          required
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          {message.length}/1000 символов (минимум 50)
        </p>
      </div>

      <div>
        <Label htmlFor="price">Предложенная цена (в баллах)</Label>
        <Input
          id="price"
          type="number"
          value={proposedPrice}
          onChange={(e) => setProposedPrice(e.target.value)}
          placeholder="От 50 до 2000"
          min={50}
          max={2000}
          className="mt-2 h-11 text-base touch-manipulation"
          style={{ fontSize: '16px' }}
          required
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          С вашего счёта будет списан 1 балл за отклик
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4">
        <Button
          type="submit"
          disabled={loading || message.trim().length < 50 || !proposedPrice}
          className="flex-1 order-2 sm:order-1"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Отправляем...
            </>
          ) : (
            'Отправить отклик'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="order-1 sm:order-2 sm:flex-shrink-0"
          size="lg"
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}

