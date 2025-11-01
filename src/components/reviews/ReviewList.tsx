/**
 * Список отзывов с пагинацией
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Star } from 'lucide-react'
import { ReviewCard } from './ReviewCard'
import type { ReviewsResponse } from '@/types/review'

interface ReviewListProps {
  specialistId: string
  initialReviews?: ReviewsResponse
  className?: string
}

export function ReviewList({ specialistId, initialReviews, className = '' }: ReviewListProps) {
  const [data, setData] = useState<ReviewsResponse | null>(initialReviews || null)
  const [loading, setLoading] = useState(!initialReviews)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadReviews = useCallback(async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(
        `/api/reviews?specialistId=${specialistId}&page=${pageNum}&limit=3`
      )

      if (response.ok) {
        const reviewsData: ReviewsResponse = await response.json()
        
        if (pageNum === 1) {
          setData(reviewsData)
        } else {
          // Добавляем новые отзывы к существующим
          setData(prev => ({
            ...prev!,
            reviews: [...prev!.reviews, ...reviewsData.reviews],
            pagination: reviewsData.pagination
          }))
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [specialistId])

  // Загрузка данных
  useEffect(() => {
    if (!initialReviews) {
      loadReviews(1)
    }
  }, [specialistId, initialReviews, loadReviews])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadReviews(nextPage)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Пока нет отзывов
        </h3>
        <p className="text-gray-600">
          Будьте первым, кто оставит отзыв об этом специалисте
        </p>
      </div>
    )
  }

  const hasMore = page < data.pagination.pages

  return (
    <section id="reviews" className={className}>
      {/* Список отзывов */}
      <div className="space-y-4">
        {data.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Кнопка "Показать ещё" */}
      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            size="lg"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Загружаем...
              </>
            ) : (
              'Показать ещё'
            )}
          </Button>
        </div>
      )}
    </section>
  )
}

