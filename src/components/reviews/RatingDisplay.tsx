/**
 * Компонент для отображения рейтинга со звёздами и количеством отзывов
 */

'use client'

import { Star } from 'lucide-react'
import { pluralize } from '@/lib/utils/pluralize'

interface RatingDisplayProps {
  rating?: number
  totalReviews?: number
  size?: 'sm' | 'md' | 'lg'
  showReviewsCount?: boolean
  className?: string
}

const sizeConfig = {
  sm: {
    star: 'h-3 w-3',
    ratingText: 'text-sm',
    reviewText: 'text-xs'
  },
  md: {
    star: 'h-4 w-4',
    ratingText: 'text-base',
    reviewText: 'text-sm'
  },
  lg: {
    star: 'h-5 w-5',
    ratingText: 'text-lg font-semibold',
    reviewText: 'text-sm'
  }
}

export function RatingDisplay({ 
  rating, 
  totalReviews, 
  size = 'md',
  showReviewsCount = true,
  className = ''
}: RatingDisplayProps) {
  const config = sizeConfig[size]
  
  // Если нет данных - не показываем
  if (!totalReviews || totalReviews === 0 || !rating || rating <= 0) {
    return null
  }
  
  const roundedRating = Math.round(rating * 10) / 10 // Округляем до 1 знака

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Звёзды */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${config.star} ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Рейтинг */}
      <span className={`${config.ratingText} font-semibold`}>
        {roundedRating}
      </span>

      {/* Количество отзывов */}
      {showReviewsCount && (
        <span className={config.reviewText}>
          ({totalReviews} {pluralize(totalReviews, 'отзыв', 'отзыва', 'отзывов')})
        </span>
      )}
    </div>
  )
}

