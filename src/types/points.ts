import { TransactionType, BalanceType } from '@/lib/points/points-service';

/**
 * Баланс пользователя (для API ответов)
 */
export interface UserBalance {
  balance: string;
  bonusBalance: string;
  bonusExpiresAt: string | null;
  total: string;
}

/**
 * Транзакция (для API ответов)
 */
export interface TransactionItem {
  id: string;
  type: TransactionType;
  amount: string;
  balanceType: BalanceType;
  balanceBefore: string;
  balanceAfter: string;
  description: string | null;
  metadata: any;
  createdAt: string;
}

/**
 * История транзакций (для API ответов)
 */
export interface TransactionHistory {
  transactions: TransactionItem[];
  total: number;
  hasMore: boolean;
}

/**
 * Результат операции с баллами
 */
export interface PointsOperationResult {
  success: boolean;
  balance: UserBalance;
  transactions?: TransactionItem[];
  error?: string;
}

