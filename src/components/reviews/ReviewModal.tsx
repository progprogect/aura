/**
 * Модальное окно для создания отзыва
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Star } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'

interface ReviewModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReviewModal({ orderId, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Сброс формы при закрытии
  useEffect(() => {
    if (!isOpen) {
      setRating(0)
      setComment('')
      setError('')
      setHoveredRating(0)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Выберите рейтинг от 1 до 5 звёзд')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          rating,
          comment: comment.trim() || null
        })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
        onClose()
      } else {
        setError(data.error || 'Ошибка при создании отзыва')
      }
    } catch (error) {
      setError('Произошла ошибка. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Оцените работу специалиста"
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="order-2 sm:order-1 sm:flex-shrink-0"
            size="lg"
          >
            Пропустить
          </Button>
          <Button
            type="submit"
            form="review-form"
            disabled={loading || rating === 0}
            className="flex-1 order-1 sm:order-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Отправляем...
              </>
            ) : (
              'Отправить отзыв'
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Ваш отзыв поможет другим пользователям выбрать специалиста
          </p>
        </div>

        <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-base">Рейтинг *</Label>
            <div className="flex items-center gap-1 sm:gap-2 mt-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform active:scale-95"
                  aria-label={`Оценить ${star} звезд`}
                >
                  <Star
                    className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-3 font-medium">
                {rating === 1 && 'Ужасно'}
                {rating === 2 && 'Плохо'}
                {rating === 3 && 'Нормально'}
                {rating === 4 && 'Хорошо'}
                {rating === 5 && 'Отлично'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="comment" className="text-base">Отзыв (опционально)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Расскажите о вашем опыте работы..."
              rows={4}
              maxLength={1000}
              className="mt-2 resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {comment.length}/1000 символов
            </p>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
