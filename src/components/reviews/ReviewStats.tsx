/**
 * Статистика отзывов: средний рейтинг и распределение
 */

'use client'

import { Star } from 'lucide-react'
import type { ReviewDistribution } from '@/types/review'
import { pluralize } from '@/lib/utils/pluralize'

interface ReviewStatsProps {
  averageRating: number
  totalReviews: number
  distribution: ReviewDistribution
}

export function ReviewStats({ averageRating, totalReviews, distribution }: ReviewStatsProps) {
  const roundedRating = Math.round(averageRating * 10) / 10

  // Вычисляем проценты для каждой оценки
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0
    return Math.round((count / totalReviews) * 100)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Средний рейтинг (большими цифрами) */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-5xl font-bold text-gray-900">{roundedRating}</span>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {totalReviews} {pluralize(totalReviews, 'отзыв', 'отзыва', 'отзывов')}
            </div>
          </div>
        </div>
      </div>

      {/* Распределение рейтингов */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Распределение оценок</h3>
        
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating as keyof ReviewDistribution]
          const percentage = getPercentage(count)
          
          return (
            <div key={rating} className="flex items-center gap-3">
              {/* Оценка */}
              <div className="flex items-center gap-1 w-16 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-900">{rating}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              </div>

              {/* Прогресс бар */}
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Количество */}
              <div className="text-sm text-gray-600 w-12 text-right flex-shrink-0">
                {count}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

