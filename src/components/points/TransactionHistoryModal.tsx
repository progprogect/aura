'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import {
  formatPoints,
  formatRelativeTime,
  getTransactionLabel,
  getTransactionIcon,
  getTransactionColor,
  TransactionType,
} from '@/lib/points/format';
import { TransactionItem } from '@/types/points';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно с историей транзакций
 */
export function TransactionHistoryModal({ isOpen, onClose }: TransactionHistoryModalProps) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/transactions?limit=50');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">История операций</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">📋</div>
              <p className="text-gray-600">История операций пуста</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Показаны последние 50 операций
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Строка транзакции
 */
function TransactionRow({ transaction }: { transaction: TransactionItem }) {
  const Icon = getTransactionIcon(transaction.type);
  const color = getTransactionColor(transaction.type);
  const amount = parseFloat(transaction.amount);
  const isPositive = amount > 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      {/* Icon */}
      <div className={`p-3 rounded-full ${isPositive ? 'bg-green-100' : 'bg-gray-200'}`}>
        <Icon className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-gray-600'}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">
          {getTransactionLabel(transaction.type)}
        </div>
        {transaction.description && (
          <div className="text-sm text-gray-600 truncate">
            {transaction.description}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-1">
          {formatRelativeTime(transaction.createdAt)}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <div className={`font-semibold ${color} flex items-center gap-1`}>
          {isPositive ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          {isPositive ? '+' : ''}
          {formatPoints(amount)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {transaction.balanceType === 'bonusBalance' ? 'Бонусные' : 'Основные'}
        </div>
      </div>
    </div>
  );
}

