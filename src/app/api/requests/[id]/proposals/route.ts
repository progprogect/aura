/**
 * API для откликов на заявки
 * POST - создать отклик (списание 1 балла)
 * GET - список откликов на заявку
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CreateProposalSchema } from '@/lib/validations/api'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { PointsService } from '@/lib/points/points-service'
import { Decimal } from 'decimal.js'
import { notifyUserAboutNewProposal } from '@/lib/notifications/sms-notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    if (!session.specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Только специалисты могут откликаться на заявки' },
        { status: 403 }
      )
    }

    const requestId = params.id
    const body = await request.json()
    const data = CreateProposalSchema.parse(body)

    // Получаем заявку
    const userRequest = await prisma.userRequest.findUnique({
      where: { id: requestId }
    })

    if (!userRequest) {
      return NextResponse.json(
        { success: false, error: 'Заявка не найдена' },
        { status: 404 }
      )
    }

    if (userRequest.status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'Заявка больше не принимает отклики' },
        { status: 400 }
      )
    }

    // Гарантируем, что specialistProfile существует (уже проверено выше)
    const specialistProfileId = session.specialistProfile.id
    const specialistCategory = session.specialistProfile.category

    // Проверяем категорию специалиста
    if (userRequest.category !== specialistCategory) {
      return NextResponse.json(
        { success: false, error: 'Вы можете откликаться только на заявки в вашей категории' },
        { status: 403 }
      )
    }

    // Проверяем, не откликался ли уже специалист
    const existingProposal = await prisma.proposal.findUnique({
      where: {
        requestId_specialistId: {
          requestId,
          specialistId: specialistProfileId
        }
      }
    })

    if (existingProposal) {
      return NextResponse.json(
        { success: false, error: 'Вы уже откликнулись на эту заявку' },
        { status: 400 }
      )
    }

    // Проверяем баланс специалиста (минимум 1 балл для отклика)
    const balance = await PointsService.getBalance(session.userId)
    const totalBalance = balance.total.toNumber()

    if (totalBalance < 1) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно баллов для отклика. Нужно минимум 1 балл' },
        { status: 400 }
      )
    }

    // Списываем 1 балл и создаём отклик в транзакции
    // Гарантируем, что specialistProfile существует (уже проверено выше)
    const specialistProfileId = session.specialistProfile.id

    const result = await prisma.$transaction(async (tx) => {
      // Списываем 1 балл
      await PointsService.deductPoints(
        session.userId,
        new Decimal(1),
        'request_received',
        `Отклик на заявку: ${userRequest.title}`,
        {
          requestId,
          requestTitle: userRequest.title
        }
      )

      // Создаём отклик
      const proposal = await tx.proposal.create({
        data: {
          requestId,
          specialistId: specialistProfileId,
          message: data.message,
          proposedPrice: data.proposedPrice,
          status: 'pending'
        },
        include: {
          specialist: {
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
          }
        }
      })

      return proposal
    })

    // Отправляем SMS уведомление пользователю (асинхронно)
    notifyUserAboutNewProposal(userRequest.userId, result.specialist.user.firstName, userRequest.title).catch(err => {
      console.error('[API/proposals] Ошибка отправки уведомления:', err)
    })

    return NextResponse.json({
      success: true,
      proposal: result,
      message: 'Отклик отправлен! С вашего счёта списан 1 балл.'
    })

  } catch (error) {
    console.error('[API/requests/[id]/proposals/POST] Ошибка:', error)
    
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: (error as any).issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Недостаточно баллов')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при создании отклика' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id

    // Получаем отклики на заявку (публичный список)
    const proposals = await prisma.proposal.findMany({
      where: {
        requestId,
        status: {
          in: ['pending', 'accepted']
        }
      },
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
    })

    return NextResponse.json({
      success: true,
      proposals
    })

  } catch (error) {
    console.error('[API/requests/[id]/proposals/GET] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при получении откликов' },
      { status: 500 }
    )
  }
}

