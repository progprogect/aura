/**
 * Типы транзакций
 */
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
  | 'package_purchase'
  | 'lead_magnet_purchase';

/**
 * Тип баланса
 */
export type BalanceType = 'balance' | 'bonusBalance';

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

