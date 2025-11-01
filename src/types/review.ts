/**
 * Типы для системы отзывов и рейтинга
 */

export interface ReviewWithUser {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    firstName: string
    lastName: string
    avatar: string | null
  }
  order: {
    service: {
      title: string
      emoji: string
    }
  }
}

export interface ReviewDistribution {
  5: number
  4: number
  3: number
  2: number
  1: number
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  distribution: ReviewDistribution
}

export interface ReviewsResponse {
  success: boolean
  reviews: ReviewWithUser[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: ReviewStats
}

