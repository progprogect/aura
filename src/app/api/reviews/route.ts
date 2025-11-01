/**
 * API для создания и получения отзывов
 * POST /api/reviews - создать отзыв
 * GET /api/reviews - получить список отзывов
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { CreateReviewSchema } from '@/lib/validations/api'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { updateSpecialistReviewStats, getReviewDistribution } from '@/lib/reviews/stats-service'
import type { ReviewsResponse } from '@/types/review'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const specialistId = searchParams.get('specialistId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!specialistId) {
      return NextResponse.json(
        { success: false, error: 'Параметр specialistId обязателен' },
        { status: 400 }
      )
    }

    // Валидация пагинации
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { success: false, error: 'Некорректные параметры пагинации' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // Получаем отзывы и статистику параллельно для оптимизации
    const [reviews, total, specialist, distribution] = await Promise.all([
      prisma.review.findMany({
        where: { specialistId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          order: {
            include: {
              service: {
                select: {
                  title: true,
                  emoji: true
                }
              }
            }
          }
        }
      }),
      prisma.review.count({
        where: { specialistId }
      }),
      prisma.specialistProfile.findUnique({
        where: { id: specialistId },
        select: {
          averageRating: true,
          totalReviews: true
        }
      }),
      getReviewDistribution(specialistId)
    ])

    // Формируем ответ
    const response: ReviewsResponse = {
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          firstName: review.user.firstName,
          lastName: review.user.lastName,
          avatar: review.user.avatar
        },
        order: {
          service: {
            title: review.order.service.title,
            emoji: review.order.service.emoji
          }
        }
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        averageRating: specialist?.averageRating || 0,
        totalReviews: specialist?.totalReviews || 0,
        distribution
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[API/reviews/GET] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при получении отзывов' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    const body = await request.json()
    const data = CreateReviewSchema.parse(body)

    // Получаем заказ
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        specialistProfile: {
          select: {
            id: true,
            userId: true
          }
        },
        request: {
          select: {
            id: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь - владелец заказа
    if (order.clientUserId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Нет прав для создания отзыва на этот заказ' },
        { status: 403 }
      )
    }

    // Проверяем, что заказ завершён
    if (order.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Отзыв можно оставить только на завершённый заказ' },
        { status: 400 }
      )
    }

    // Проверяем, нет ли уже отзыва на этот заказ
    const existingReview = await prisma.review.findUnique({
      where: { orderId: data.orderId }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Отзыв уже оставлен на этот заказ' },
        { status: 400 }
      )
    }

    // Создаём отзыв
    const review = await prisma.review.create({
      data: {
        orderId: data.orderId,
        specialistId: order.specialistProfile.id,
        userId: session.userId,
        rating: data.rating,
        comment: data.comment || null
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    // Обновляем статистику специалиста (real-time) - вне транзакции
    updateSpecialistReviewStats(order.specialistProfile.id).catch(err => {
      console.error('[API/reviews/POST] Ошибка обновления статистики:', err)
    })

    return NextResponse.json({
      success: true,
      review
    })

  } catch (error) {
    console.error('[API/reviews/POST] Ошибка:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

