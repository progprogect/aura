/**
 * Валидатор баланса транзакций
 */

import { prisma } from '@/lib/db'
import { Decimal } from 'decimal.js'

export interface AuditResult {
  isValid: boolean
  errors: string[]
  totalTransactions: number
  checkedTransactions: number
}

export class BalanceValidator {
  /**
   * Проверка баланса после операции
   */
  static async validateTransaction(
    transactionId: string,
    expectedBalance: Decimal
  ): Promise<boolean> {
    // Получаем все транзакции, связанные с операцией
    const transactions = await prisma.transaction.findMany({
      where: {
        metadata: {
          path: ['transactionId'],
          equals: transactionId,
        },
      },
    })

    // Суммируем все транзакции
    const total = transactions.reduce((sum, t) => {
      return sum.add(new Decimal(t.amount))
    }, new Decimal(0))

    // Проверяем, что итоговый баланс = 0
    return total.eq(expectedBalance)
  }

  /**
   * Аудит всех операций за период
   */
  static async auditPeriod(start: Date, end: Date): Promise<AuditResult> {
    const errors: string[] = []
    let checkedTransactions = 0

    // Получаем все PlatformRevenue за период
    const revenues = await prisma.platformRevenue.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: 'completed',
      },
      include: {
        // Здесь можно добавить связи, если нужно
      },
    })

    for (const revenue of revenues) {
      checkedTransactions++

      // Проверяем баланс для каждой операции
      const commission = new Decimal(revenue.commissionAmount)
      const cashback = new Decimal(revenue.cashbackAmount)
      const netRevenue = new Decimal(revenue.netRevenue)

      // Проверка: комиссия - кешбэк = чистая прибыль
      const calculatedNetRevenue = commission.sub(cashback)
      if (!calculatedNetRevenue.eq(netRevenue)) {
        errors.push(
          `PlatformRevenue ${revenue.id}: netRevenue mismatch. Expected: ${calculatedNetRevenue}, Got: ${netRevenue}`
        )
      }

      // Проверка: комиссия >= кешбэк
      if (commission.lt(cashback)) {
        errors.push(
          `PlatformRevenue ${revenue.id}: commission (${commission}) < cashback (${cashback})`
        )
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalTransactions: revenues.length,
      checkedTransactions,
    }
  }

  /**
   * Проверка общего баланса платформы
   */
  static async validatePlatformBalance(): Promise<{
    isValid: boolean
    totalCommission: Decimal
    totalCashback: Decimal
    totalNetRevenue: Decimal
    platformBalance: Decimal
  }> {
    // Получаем все комиссии
    const revenues = await prisma.platformRevenue.aggregate({
      where: {
        status: 'completed',
      },
      _sum: {
        commissionAmount: true,
        cashbackAmount: true,
        netRevenue: true,
      },
    })

    const totalCommission = new Decimal(revenues._sum.commissionAmount || 0)
    const totalCashback = new Decimal(revenues._sum.cashbackAmount || 0)
    const totalNetRevenue = new Decimal(revenues._sum.netRevenue || 0)

    // Получаем баланс системного пользователя
    const platformUser = await prisma.user.findUnique({
      where: { id: 'platform-system-user' },
      select: { balance: true },
    })

    const platformBalance = platformUser
      ? new Decimal(platformUser.balance)
      : new Decimal(0)

    // Проверка: чистая прибыль должна быть равна балансу платформы (с учетом округлений)
    const isValid = totalNetRevenue.sub(platformBalance).abs().lt(0.01)

    return {
      isValid,
      totalCommission,
      totalCashback,
      totalNetRevenue,
      platformBalance,
    }
  }
}

