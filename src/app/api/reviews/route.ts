/**
 * API для создания отзывов
 * POST /api/reviews - создать отзыв
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateReviewSchema } from '@/lib/validations/api'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

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

    return NextResponse.json({
      success: true,
      review
    })

  } catch (error) {
    console.error('[API/reviews/POST] Ошибка:', error)
    
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: (error as any).issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при создании отзыва' },
      { status: 500 }
    )
  }
}

