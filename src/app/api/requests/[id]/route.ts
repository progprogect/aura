/**
 * API для получения деталей заявки
 * GET - публичная страница заявки с откликами
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthSession } from '@/lib/auth/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id
    const session = await getAuthSession(request)

    // Получаем заявку с откликами
    const userRequest = await prisma.userRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        proposals: {
          include: {
            specialist: {
              select: {
                id: true,
                slug: true,
                category: true,
                verified: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        selectedSpecialist: {
          select: {
            id: true,
            slug: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        order: {
          select: {
            id: true,
            status: true,
            pointsUsed: true
          }
        }
      }
    })

    if (!userRequest) {
      return NextResponse.json(
        { success: false, error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    // Проверяем права доступа (можно просматривать все заявки, но откликаться могут только специалисты)
    const canRespond = session?.specialistProfile !== null && 
                      session?.specialistProfile?.category === userRequest.category

    return NextResponse.json({
      success: true,
      request: userRequest,
      canRespond // Может ли текущий пользователь откликнуться
    })

  } catch (error) {
    console.error('[API/requests/[id]/GET] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при получении заявки' },
      { status: 500 }
    )
  }
}

