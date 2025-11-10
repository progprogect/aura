/**
 * API endpoint для добавления бонусных баллов специалисту
 * POST /api/admin/specialists/[id]/points
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/permissions'
import { prisma } from '@/lib/db'
import { PointsService } from '@/lib/points/points-service'
import { Decimal } from '@prisma/client/runtime/library'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request)

    const body = await request.json()
    const { amount, reason } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Количество баллов должно быть положительным числом' },
        { status: 400 }
      )
    }

    const specialist = await prisma.specialistProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            bonusBalance: true,
            bonusExpiresAt: true,
          },
        },
      },
    })

    if (!specialist) {
      return NextResponse.json(
        { success: false, error: 'Специалист не найден' },
        { status: 404 }
      )
    }

    const userId = specialist.userId
    const pointsAmount = new Decimal(amount)

    // Начисляем бонусные баллы
    const bonusExpiresAt = new Date()
    bonusExpiresAt.setDate(bonusExpiresAt.getDate() + 7) // 7 дней как у регистрационного бонуса

    await prisma.$transaction(async (tx) => {
      // Получить текущий баланс
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { bonusBalance: true, bonusExpiresAt: true },
      })

      if (!user) {
        throw new Error('Пользователь не найден')
      }

      const balanceBefore = user.bonusBalance
      const balanceAfter = balanceBefore.add(pointsAmount)

      // Обновить баланс и срок действия бонуса
      await tx.user.update({
        where: { id: userId },
        data: {
          bonusBalance: balanceAfter,
          bonusExpiresAt: bonusExpiresAt > (user.bonusExpiresAt || new Date(0))
            ? bonusExpiresAt
            : user.bonusExpiresAt,
        },
      })

      // Записать транзакцию
      await tx.transaction.create({
        data: {
          userId,
          type: 'bonus_reward',
          amount: pointsAmount,
          balanceType: 'bonusBalance',
          balanceBefore,
          balanceAfter,
          description: reason || `Начисление бонусных баллов администратором: ${amount} баллов`,
          metadata: {
            adminId: admin.adminId,
            adminUsername: admin.username,
            specialistId: specialist.id,
            reason: reason || null,
            expiresAt: bonusExpiresAt.toISOString(),
          },
        },
      })
    })

    // Получаем обновленный баланс
    const updatedBalance = await PointsService.getBalance(userId)

    return NextResponse.json({
      success: true,
      message: `Начислено ${amount} бонусных баллов`,
      balance: {
        balance: updatedBalance.balance.toString(),
        bonusBalance: updatedBalance.bonusBalance.toString(),
        total: updatedBalance.total.toString(),
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Ошибка начисления баллов:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

