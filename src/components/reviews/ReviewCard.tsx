/**
 * Карточка одного отзыва
 */

'use client'

import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { ReviewWithUser } from '@/types/review'

interface ReviewCardProps {
  review: ReviewWithUser
}

export function ReviewCard({ review }: ReviewCardProps) {
  const firstNameInitial = review.user.firstName?.[0] || '?'
  const lastNameInitial = review.user.lastName?.[0] || '?'
  const initials = `${firstNameInitial}${lastNameInitial}`
  
  const formattedDate = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
    locale: ru
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
      {/* Заголовок с пользователем и датой */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            src={review.user.avatar || undefined}
            alt={`${review.user.firstName} ${review.user.lastName}`}
            size={40}
            fallback={initials}
          />
          <div>
            <div className="font-semibold text-gray-900">
              {review.user.firstName} {lastNameInitial}.
            </div>
            <div className="text-xs text-gray-500">{formattedDate}</div>
          </div>
        </div>

        {/* Рейтинг */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Комментарий */}
      {review.comment && (
        <div className="text-sm text-gray-700 leading-relaxed">
          {review.comment}
        </div>
      )}

      {/* Услуга */}
      <div className="pt-2 border-t border-gray-100">
        <Badge variant="secondary" className="text-xs">
          <span className="mr-1">{review.order.service.emoji}</span>
          {review.order.service.title}
        </Badge>
      </div>
    </div>
  )
}

