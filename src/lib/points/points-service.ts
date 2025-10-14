import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import { Transaction, User } from '@prisma/client';

export type TransactionType =
  | 'bonus_registration'
  | 'bonus_reward'
  | 'bonus_expired'
  | 'purchase'
  | 'refund'
  | 'withdrawal'
  | 'deposit'
  | 'service_purchase'
  | 'service_completion'
  | 'auto_completion'
  | 'dispute_refund'
  | 'contact_view'
  | 'request_received'
  | 'package_purchase';

export type BalanceType = 'balance' | 'bonusBalance';

export interface UserBalance {
  balance: Decimal;
  bonusBalance: Decimal;
  bonusExpiresAt: Date | null;
  total: Decimal;
}

/**
 * Сервис управления баллами (внутренняя валюта)
 * 
 * Основные принципы:
 * - 1 балл = 1 условная единица
 * - Два типа баллов: обычные и бонусные
 * - Бонусные сгорают через 7 дней
 * - При списании сначала используются бонусные баллы
 * - Все операции атомарны и записываются в Transaction
 */
export class PointsService {
  private static REGISTRATION_BONUS = new Decimal(50);
  private static BONUS_EXPIRY_DAYS = 7;

  /**
   * Начислить бонусные баллы при регистрации
   */
  static async grantRegistrationBonus(userId: string): Promise<void> {
    const bonusExpiresAt = new Date();
    bonusExpiresAt.setDate(bonusExpiresAt.getDate() + this.BONUS_EXPIRY_DAYS);

    await prisma.$transaction(async (tx) => {
      // Получить текущий баланс
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { bonusBalance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = user.bonusBalance;
      const balanceAfter = balanceBefore.add(this.REGISTRATION_BONUS);

      // Обновить баланс
      await tx.user.update({
        where: { id: userId },
        data: {
          bonusBalance: balanceAfter,
          bonusExpiresAt,
        },
      });

      // Записать транзакцию
      await tx.transaction.create({
        data: {
          userId,
          type: 'bonus_registration',
          amount: this.REGISTRATION_BONUS,
          balanceType: 'bonusBalance',
          balanceBefore,
          balanceAfter,
          description: `Бонус за регистрацию: ${this.REGISTRATION_BONUS} баллов`,
          metadata: {
            expiresAt: bonusExpiresAt.toISOString(),
          },
        },
      });
    });
  }

  /**
   * Получить баланс пользователя
   */
  static async getBalance(userId: string): Promise<UserBalance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        bonusBalance: true,
        bonusExpiresAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      balance: user.balance,
      bonusBalance: user.bonusBalance,
      bonusExpiresAt: user.bonusExpiresAt,
      total: user.balance.add(user.bonusBalance),
    };
  }

  /**
   * Добавить баллы (deposit, bonus)
   */
  static async addPoints(
    userId: string,
    amount: Decimal,
    type: TransactionType,
    balanceType: BalanceType,
    description?: string,
    metadata?: any
  ): Promise<Transaction> {
    if (amount.lte(0)) {
      throw new Error('Amount must be positive');
    }

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true, bonusBalance: true, bonusExpiresAt: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = balanceType === 'balance' ? user.balance : user.bonusBalance;
      const balanceAfter = balanceBefore.add(amount);

      // Обновить баланс
      const updateData: any = {};
      updateData[balanceType] = balanceAfter;

      // Если добавляем бонусные баллы и нет срока истечения, установить его
      if (balanceType === 'bonusBalance' && !user.bonusExpiresAt) {
        const bonusExpiresAt = new Date();
        bonusExpiresAt.setDate(bonusExpiresAt.getDate() + this.BONUS_EXPIRY_DAYS);
        updateData.bonusExpiresAt = bonusExpiresAt;
      }

      await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      // Записать транзакцию
      return await tx.transaction.create({
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
      });
    });
  }

  /**
   * Списать баллы (приоритет: bonus -> balance)
   * Запрещает отрицательный баланс - используется для исходящих операций (покупки)
   */
  static async deductPoints(
    userId: string,
    amount: Decimal,
    type: TransactionType,
    description?: string,
    metadata?: any
  ): Promise<Transaction[]> {
    if (amount.lte(0)) {
      throw new Error('Amount must be positive');
    }

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true, bonusBalance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const total = user.balance.add(user.bonusBalance);
      if (total.lt(amount)) {
        throw new Error('Insufficient balance');
      }

      return this.performDeduction(tx, user, amount, type, description, metadata, userId);
    });
  }

  /**
   * Списать баллы для входящих операций (разрешает отрицательный баланс)
   * Используется для: заявок от клиентов, просмотров контактов
   */
  static async deductPointsForIncoming(
    userId: string,
    amount: Decimal,
    type: TransactionType,
    description?: string,
    metadata?: any
  ): Promise<Transaction[]> {
    if (amount.lte(0)) {
      throw new Error('Amount must be positive');
    }

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true, bonusBalance: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Для входящих операций НЕ проверяем достаточность баланса
      return this.performDeduction(tx, user, amount, type, description, metadata, userId);
    });
  }

  /**
   * Выполнить списание баллов (общая логика)
   */
  private static async performDeduction(
    tx: any,
    user: any,
    amount: Decimal,
    type: TransactionType,
    description?: string,
    metadata?: any,
    userId?: string
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    let remaining = amount;

    // 1. Сначала списываем бонусные баллы
    if (user.bonusBalance.gt(0) && remaining.gt(0)) {
      const deductFromBonus = Decimal.min(user.bonusBalance, remaining);
      const bonusBalanceBefore = user.bonusBalance;
      const bonusBalanceAfter = bonusBalanceBefore.sub(deductFromBonus);

      await tx.user.update({
        where: { id: userId },
        data: {
          bonusBalance: bonusBalanceAfter,
          // Если бонусный баланс стал 0, убираем дату истечения
          ...(bonusBalanceAfter.eq(0) ? { bonusExpiresAt: null } : {}),
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: userId,
          type,
          amount: deductFromBonus.neg(), // Отрицательное значение для списания
          balanceType: 'bonusBalance',
          balanceBefore: bonusBalanceBefore,
          balanceAfter: bonusBalanceAfter,
          description: description || `Списание ${deductFromBonus} бонусных баллов`,
          metadata,
        },
      });

      transactions.push(transaction);
      remaining = remaining.sub(deductFromBonus);
    }

    // 2. Затем списываем обычные баллы
    if (remaining.gt(0)) {
      const balanceBefore = user.balance;
      const balanceAfter = balanceBefore.sub(remaining);

      await tx.user.update({
        where: { id: userId },
        data: { balance: balanceAfter },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: userId,
          type,
          amount: remaining.neg(), // Отрицательное значение для списания
          balanceType: 'balance',
          balanceBefore,
          balanceAfter,
          description: description || `Списание ${remaining} баллов`,
          metadata,
        },
      });

      transactions.push(transaction);
    }

    return transactions;
  }

  /**
   * Проверить баланс (достаточно ли средств)
   */
  static async hasEnoughPoints(userId: string, amount: Decimal): Promise<boolean> {
    const { total } = await this.getBalance(userId);
    return total.gte(amount);
  }

  /**
   * История транзакций
   */
  static async getTransactionHistory(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<Transaction[]> {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Подсчитать общее количество транзакций
   */
  static async getTransactionCount(userId: string): Promise<number> {
    return await prisma.transaction.count({
      where: { userId },
    });
  }

  /**
   * Проверить и аннулировать просроченные бонусы
   */
  static async expireOldBonuses(): Promise<{ expiredCount: number; totalAmount: Decimal }> {
    const now = new Date();
    let expiredCount = 0;
    let totalAmount = new Decimal(0);

    // Найти пользователей с просроченными бонусами
    const usersWithExpiredBonuses = await prisma.user.findMany({
      where: {
        bonusBalance: { gt: 0 },
        bonusExpiresAt: { lte: now },
      },
      select: { id: true, bonusBalance: true },
    });

    for (const user of usersWithExpiredBonuses) {
      await prisma.$transaction(async (tx) => {
        const balanceBefore = user.bonusBalance;
        const balanceAfter = new Decimal(0);

        // Обнулить бонусный баланс
        await tx.user.update({
          where: { id: user.id },
          data: {
            bonusBalance: balanceAfter,
            bonusExpiresAt: null,
          },
        });

        // Записать транзакцию
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: 'bonus_expired',
            amount: balanceBefore.neg(),
            balanceType: 'bonusBalance',
            balanceBefore,
            balanceAfter,
            description: `Срок действия бонусных баллов истёк`,
            metadata: {
              expiredAt: now.toISOString(),
            },
          },
        });

        expiredCount++;
        totalAmount = totalAmount.add(balanceBefore);
      });
    }

    return { expiredCount, totalAmount };
  }
}

