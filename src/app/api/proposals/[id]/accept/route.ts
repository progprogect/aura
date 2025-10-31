/**
 * API для принятия отклика специалиста
 * PATCH - принять отклик и создать заказ
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { PointsService } from '@/lib/points/points-service'
import { Decimal } from 'decimal.js'
import { createTemporaryServiceForRequest } from '@/lib/services/service-creator'
import { notifySpecialistAboutAcceptedProposal } from '@/lib/notifications/sms-notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    const proposalId = params.id

    // Получаем отклик с заявкой
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        request: {
          include: {
            user: true
          }
        },
        specialist: {
          include: {
            user: true
          }
        }
      }
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Отклик не найден' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь - владелец заявки
    if (proposal.request.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'Нет прав для принятия этого отклика' },
        { status: 403 }
      )
    }

    // Проверяем статус заявки
    if (proposal.request.status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'Заявка больше не принимает отклики' },
        { status: 400 }
      )
    }

    // Проверяем баланс пользователя
    const balance = await PointsService.getBalance(session.userId)
    const totalBalance = balance.total.toNumber()

    if (totalBalance < proposal.proposedPrice) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Недостаточно баллов. Нужно: ${proposal.proposedPrice} баллов (цена специалиста)` 
        },
        { status: 400 }
      )
    }

    // Создаём заказ в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Создаём временную Service
      const service = await createTemporaryServiceForRequest(
        proposal.specialistId,
        proposal.request.title,
        proposal.proposedPrice
      )

      // Устанавливаем дату автоподтверждения (через 7 дней)
      const autoConfirmAt = new Date()
      autoConfirmAt.setDate(autoConfirmAt.getDate() + 7)

      // Создаём Order
      const order = await tx.order.create({
        data: {
          serviceId: service.id,
          specialistProfileId: proposal.specialistId,
          requestId: proposal.request.id,
          clientName: `${proposal.request.user.firstName} ${proposal.request.user.lastName}`,
          clientContact: proposal.request.user.phone || '',
          clientUserId: proposal.request.userId,
          status: 'paid',
          pointsUsed: proposal.proposedPrice,
          pointsFrozen: true,
          escrowReleased: false,
          autoConfirmAt
        }
      })

      // Обновляем отклик - принимаем его
      await tx.proposal.update({
        where: { id: proposalId },
        data: {
          status: 'accepted',
          acceptedAt: new Date()
        }
      })

      // Отклоняем остальные отклики на эту заявку
      await tx.proposal.updateMany({
        where: {
          requestId: proposal.request.id,
          id: { not: proposalId },
          status: 'pending'
        },
        data: {
          status: 'rejected',
          rejectedAt: new Date()
        }
      })

      // Обновляем заявку - переводим в in_progress
      await tx.userRequest.update({
        where: { id: proposal.request.id },
        data: {
          status: 'in_progress',
          selectedSpecialistId: proposal.specialistId,
          orderId: order.id
        }
      })

      return {
        order,
        service,
        proposal
      }
    })

    // Списываем баллы по цене специалиста (замораживание) - ПОСЛЕ создания заказа
    await PointsService.deductPoints(
      session.userId,
      new Decimal(proposal.proposedPrice),
      'order_payment',
      `Принятие отклика: ${proposal.request.title}`,
      {
        requestId: proposal.request.id,
        requestTitle: proposal.request.title,
        specialistId: proposal.specialist.userId,
        orderId: result.order.id
      }
    )

    // Отправляем SMS уведомление специалисту (асинхронно)
    notifySpecialistAboutAcceptedProposal(
      proposal.specialist.userId,
      proposal.request.user.firstName,
      proposal.request.title,
      proposal.proposedPrice
    ).catch(err => {
      console.error('[API/proposals/accept] Ошибка отправки уведомления:', err)
    })

    return NextResponse.json({
      success: true,
      order: result.order,
      message: `Отклик принят! С вашего счёта заморожено ${proposal.proposedPrice} баллов до завершения работы.`
    })

  } catch (error) {
    console.error('[API/proposals/[id]/accept/PATCH] Ошибка:', error)
    
    if (error instanceof Error && error.message.includes('Недостаточно баллов')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Произошла ошибка при принятии отклика' },
      { status: 500 }
    )
  }
}

