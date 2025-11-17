/**
 * Сервис для обработки комиссий и кешбэка
 */

import { prisma } from '@/lib/db'
import { PointsService } from '@/lib/points/points-service'
import { Decimal } from 'decimal.js'
import { COMMISSION_CONFIG } from './constants'
import type { Prisma } from '@prisma/client'

type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export interface CommissionBreakdown {
  commission: Decimal // 5% от суммы
  cashback: Decimal // 2.5% от суммы (50% от комиссии)
  specialistAmount: Decimal // 95% от суммы
  netRevenue: Decimal // 2.5% от суммы (чистая прибыль платформы)
}

export class CommissionService {
  /**
   * Расчет комиссий (без выполнения транзакций)
   */
  static calculate(amount: Decimal): CommissionBreakdown {
    // Проверка: сумма должна быть больше или равна минимальной комиссии
    // Минимальная комиссия 0.01 = 5% от суммы, значит минимальная сумма = 0.01 / 0.05 = 0.2
    const minAmount = new Decimal(COMMISSION_CONFIG.MIN_COMMISSION).div(COMMISSION_CONFIG.RATE)
    if (amount.lt(minAmount)) {
      throw new Error(
        `Amount ${amount} is too small. Minimum amount is ${minAmount} (to cover minimum commission ${COMMISSION_CONFIG.MIN_COMMISSION})`
      )
    }

    // Комиссия платформы: 5%
    let commission = amount.mul(COMMISSION_CONFIG.RATE)
    
    // Минимальная комиссия: 0.01
    if (commission.lt(COMMISSION_CONFIG.MIN_COMMISSION)) {
      commission = new Decimal(COMMISSION_CONFIG.MIN_COMMISSION)
    }
    
    // Кешбэк: 50% от комиссии (без округления - точный расчет)
    const cashback = commission.mul(0.5)
    
    // Сумма для специалиста: сумма - комиссия (без округления - точный расчет)
    const specialistAmount = amount.sub(commission)
    
    // Чистая прибыль платформы: комиссия - кешбэк (без округления - точный расчет)
    const netRevenue = commission.sub(cashback)
    
    // Валидация баланса
    const total = specialistAmount.add(commission)
    if (!total.eq(amount)) {
      throw new Error(
        `Balance mismatch: specialistAmount (${specialistAmount}) + commission (${commission}) = ${total}, expected ${amount}`
      )
    }
    
    return {
      commission,
      cashback,
      specialistAmount,
      netRevenue,
    }
  }

  /**
   * Получить ID системного пользователя платформы
   */
  static async getPlatformUserId(): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: COMMISSION_CONFIG.PLATFORM_USER_ID },
      select: { id: true },
    })

    if (!user) {
      throw new Error(
        `Platform user not found. Please run: tsx prisma/scripts/create-platform-user.ts`
      )
    }

    return user.id
  }

  /**
   * Обработка покупки лид-магнита (все в одной транзакции)
   * platformUserId должен быть получен до вызова этой функции
   */
  static async processLeadMagnetPurchase(
    tx: PrismaTransaction,
    purchaseId: string,
    clientUserId: string,
    specialistUserId: string,
    amount: Decimal,
    platformUserId: string
  ) {
    const breakdown = this.calculate(amount)

    // Проверяем, не обработана ли уже комиссия
    const purchase = await tx.leadMagnetPurchase.findUnique({
      where: { id: purchaseId },
      select: { commissionProcessed: true, cashbackProcessed: true },
    })

    if (!purchase) {
      throw new Error(`LeadMagnetPurchase not found: ${purchaseId}`)
    }

    if (purchase.commissionProcessed || purchase.cashbackProcessed) {
      throw new Error(`Commission already processed for purchase: ${purchaseId}`)
    }

    // 1. Начисляем специалисту
    await this.addPointsInTransaction(
      tx,
      specialistUserId,
      breakdown.specialistAmount,
      'lead_magnet_sale',
      'balance',
      `Продажа лид-магнита`,
      { purchaseId }
    )

    // 2. Начисляем комиссию платформе
    await this.addPointsInTransaction(
      tx,
      platformUserId,
      breakdown.commission,
      'platform_commission',
      'balance',
      `Комиссия за лид-магнит`,
      { purchaseId }
    )

    // 3. Начисляем кешбэк клиенту (бонусные баллы)
    await this.addPointsInTransaction(
      tx,
      clientUserId,
      breakdown.cashback,
      'cashback',
      'bonusBalance',
      `Кешбэк за покупку лид-магнита`,
      { purchaseId }
    )

    // 4. Списываем кешбэк с баланса платформы
    await this.deductPointsInTransaction(
      tx,
      platformUserId,
      breakdown.cashback,
      'cashback_paid',
      `Выплата кешбэка за лид-магнит`,
      { purchaseId, clientUserId }
    )

    // 5. Создаем запись PlatformRevenue
    const revenue = await tx.platformRevenue.create({
      data: {
        type: 'commission',
        leadMagnetPurchaseId: purchaseId,
        commissionAmount: breakdown.commission,
        cashbackAmount: breakdown.cashback,
        netRevenue: breakdown.netRevenue,
        clientUserId,
        specialistUserId,
        description: `Комиссия за лид-магнит`,
        status: 'completed',
      },
    })

    // 6. Обновляем LeadMagnetPurchase
    await tx.leadMagnetPurchase.update({
      where: { id: purchaseId },
      data: {
        commissionProcessed: true,
        cashbackProcessed: true,
        platformRevenueId: revenue.id,
      },
    })

    return revenue
  }

  /**
   * Начисление кешбэка при покупке услуги (сразу)
   * platformUserId должен быть получен до вызова этой функции
   */
  static async addCashbackForService(
    tx: PrismaTransaction,
    orderId: string,
    clientUserId: string,
    amount: Decimal,
    platformUserId: string
  ) {
    const breakdown = this.calculate(amount)

    // Проверяем, не обработан ли уже кешбэк
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { cashbackProcessed: true },
    })

    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    if (order.cashbackProcessed) {
      // Кешбэк уже начислен, пропускаем
      return
    }

    // 1. Начисляем кешбэк клиенту (бонусные баллы)
    await this.addPointsInTransaction(
      tx,
      clientUserId,
      breakdown.cashback,
      'cashback',
      'bonusBalance',
      `Кешбэк за покупку услуги`,
      { orderId }
    )

    // 2. Списываем кешбэк с баланса платформы
    await this.deductPointsInTransaction(
      tx,
      platformUserId,
      breakdown.cashback,
      'cashback_paid',
      `Выплата кешбэка за услугу`,
      { orderId, clientUserId }
    )

    // 3. Обновляем Order
    await tx.order.update({
      where: { id: orderId },
      data: {
        cashbackProcessed: true,
      },
    })
  }

  /**
   * Обработка завершения услуги (при подтверждении)
   * platformUserId должен быть получен до вызова этой функции
   */
  static async processServiceCompletion(
    tx: PrismaTransaction,
    orderId: string,
    clientUserId: string,
    specialistUserId: string,
    amount: Decimal,
    platformUserId: string
  ) {
    const breakdown = this.calculate(amount)

    // Проверяем, не обработана ли уже комиссия
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        commissionProcessed: true,
        cashbackProcessed: true,
        platformRevenueId: true,
      },
    })

    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    if (order.commissionProcessed) {
      throw new Error(`Commission already processed for order: ${orderId}`)
    }

    // 1. Начисляем специалисту
    await this.addPointsInTransaction(
      tx,
      specialistUserId,
      breakdown.specialistAmount,
      'service_completion',
      'balance',
      `Выполнение услуги`,
      { orderId }
    )

    // 2. Начисляем комиссию платформе
    await this.addPointsInTransaction(
      tx,
      platformUserId,
      breakdown.commission,
      'platform_commission',
      'balance',
      `Комиссия за услугу`,
      { orderId }
    )

    // 3. Создаем запись PlatformRevenue
    const revenue = await tx.platformRevenue.create({
      data: {
        type: 'commission',
        orderId,
        commissionAmount: breakdown.commission,
        cashbackAmount: breakdown.cashback,
        netRevenue: breakdown.netRevenue,
        clientUserId,
        specialistUserId,
        description: `Комиссия за услугу`,
        status: 'completed',
      },
    })

    // 4. Обновляем Order
    await tx.order.update({
      where: { id: orderId },
      data: {
        commissionProcessed: true,
        platformRevenueId: revenue.id,
      },
    })

    return revenue
  }

  /**
   * Добавить баллы в транзакции (вспомогательный метод)
   */
  private static async addPointsInTransaction(
    tx: PrismaTransaction,
    userId: string,
    amount: Decimal,
    type: string,
    balanceType: 'balance' | 'bonusBalance',
    description?: string,
    metadata?: any
  ) {
    if (amount.lte(0)) {
      throw new Error('Amount must be positive')
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { balance: true, bonusBalance: true, bonusExpiresAt: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Конвертируем Prisma Decimal в decimal.js Decimal
    const balanceBefore = new Decimal(
      balanceType === 'balance' ? user.balance.toString() : user.bonusBalance.toString()
    )
    const balanceAfter = balanceBefore.add(amount)

    const updateData: any = {}
    updateData[balanceType] = balanceAfter

    // Если добавляем бонусные баллы и нет срока истечения, установить его
    if (balanceType === 'bonusBalance' && !user.bonusExpiresAt) {
      const bonusExpiresAt = new Date()
      bonusExpiresAt.setDate(bonusExpiresAt.getDate() + 7)
      updateData.bonusExpiresAt = bonusExpiresAt
    }

    await tx.user.update({
      where: { id: userId },
      data: updateData,
    })

    await tx.transaction.create({
      data: {
        userId,
        type,
        amount,
        balanceType,
        balanceBefore,
        balanceAfter,
        description: description || `Начисление ${amount} баллов`,
        metadata,
      },
    })
  }

  /**
   * Списать баллы в транзакции (вспомогательный метод)
   */
  private static async deductPointsInTransaction(
    tx: PrismaTransaction,
    userId: string,
    amount: Decimal,
    type: string,
    description?: string,
    metadata?: any
  ) {
    if (amount.lte(0)) {
      throw new Error('Amount must be positive')
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { balance: true, bonusBalance: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Конвертируем Prisma Decimal в decimal.js Decimal
    const balance = new Decimal(user.balance.toString())
    const bonusBalance = new Decimal(user.bonusBalance.toString())
    
    const total = balance.add(bonusBalance)
    if (total.lt(amount)) {
      throw new Error('Insufficient balance')
    }

    let remaining = amount

    // 1. Сначала списываем бонусные баллы
    if (bonusBalance.gt(0) && remaining.gt(0)) {
      const deductFromBonus = Decimal.min(bonusBalance, remaining)
      const bonusBalanceBefore = bonusBalance
      const bonusBalanceAfter = bonusBalanceBefore.sub(deductFromBonus)

      await tx.user.update({
        where: { id: userId },
        data: {
          bonusBalance: bonusBalanceAfter,
          ...(bonusBalanceAfter.eq(0) ? { bonusExpiresAt: null } : {}),
        },
      })

      await tx.transaction.create({
        data: {
          userId,
          type,
          amount: deductFromBonus.neg(),
          balanceType: 'bonusBalance',
          balanceBefore: bonusBalanceBefore,
          balanceAfter: bonusBalanceAfter,
          description: description || `Списание ${deductFromBonus} бонусных баллов`,
          metadata,
        },
      })

      remaining = remaining.sub(deductFromBonus)
    }

    // 2. Затем списываем обычные баллы
    if (remaining.gt(0)) {
      const balanceBefore = balance
      const balanceAfter = balanceBefore.sub(remaining)

      await tx.user.update({
        where: { id: userId },
        data: { balance: balanceAfter },
      })

      await tx.transaction.create({
        data: {
          userId,
          type,
          amount: remaining.neg(),
          balanceType: 'balance',
          balanceBefore,
          balanceAfter,
          description: description || `Списание ${remaining} баллов`,
          metadata,
        },
      })
    }
  }

  /**
   * Валидация баланса после операции
   */
  static async validateBalance(
    clientSpent: Decimal,
    specialistReceived: Decimal,
    platformCommission: Decimal,
    cashbackPaid: Decimal
  ): Promise<boolean> {
    // Проверка: списано = начислено
    const totalSpent = clientSpent
    const totalReceived = specialistReceived.add(platformCommission)
    
    if (!totalSpent.eq(totalReceived)) {
      console.error(
        `Balance validation failed: clientSpent (${clientSpent}) != specialistReceived (${specialistReceived}) + platformCommission (${platformCommission})`
      )
      return false
    }

    // Проверка: комиссия - кешбэк = чистая прибыль
    const netRevenue = platformCommission.sub(cashbackPaid)
    if (netRevenue.lt(0)) {
      console.error(
        `Balance validation failed: netRevenue (${netRevenue}) < 0`
      )
      return false
    }

    return true
  }
}

