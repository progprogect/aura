/**
 * API для управления заявками пользователей
 * POST - создание заявки
 * GET - список заявок текущего пользователя
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateRequestSchema } from '@/lib/validations/api'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { notifySpecialistsAboutNewRequest } from '@/lib/notifications/sms-notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    const body = await request.json()
    const data = CreateRequestSchema.parse(body)

    // Проверяем, что категория существует
    const category = await prisma.category.findUnique({
      where: { key: data.category, isActive: true }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Категория не найдена или неактивна' },
        { status: 400 }
      )
    }

    // Создаём заявку
    const userRequest = await prisma.userRequest.create({
      data: {
        userId: session.userId,
        title: data.title,
        description: data.description,
        category: data.category,
        budget: data.budget,
        status: 'open'
      },
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
          select: {
            id: true
          }
        }
      }
    })

    // Отправляем SMS уведомление специалистам в категории (асинхронно, не блокируем ответ)
    notifySpecialistsAboutNewRequest(data.category, data.title, userRequest.id).catch(err => {
      console.error('[API/requests] Ошибка отправки уведомлений:', err)
    })

    return NextResponse.json({
      success: true,
      request: userRequest
    })

  } catch (error) {
    console.error('[API/requests/POST] Ошибка:', error)
    
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: (error as any).issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при создании заявки' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request)

    // Получаем query параметры
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const publicList = searchParams.get('public') === 'true'

    // Если это публичный список - возвращаем все открытые заявки (без авторизации)
    if (publicList) {
      const requests = await prisma.userRequest.findMany({
        where: {
          status: 'open'
        },
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
            select: {
              id: true,
              status: true
            }
          },
          _count: {
            select: {
              proposals: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Пагинация - первые 50
      })

      return NextResponse.json({
        success: true,
        requests
      })
    }

    // Иначе - только заявки текущего пользователя (требуется авторизация)
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    const where: any = {
      userId: session.userId
    }

    if (status) {
      where.status = status
    }

    const requests = await prisma.userRequest.findMany({
      where,
      include: {
        proposals: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            proposals: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      requests
    })

  } catch (error) {
    console.error('[API/requests/GET] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при получении заявок' },
      { status: 500 }
    )
  }
}

