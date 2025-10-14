'use client';

import { useEffect, useState } from 'react';
import { Coins, Gift, Clock, History, Loader2, AlertTriangle } from 'lucide-react';
import { formatPoints, formatTimeUntilExpiry } from '@/lib/points/format';
import { UserBalance } from '@/types/points';

interface BalanceWidgetProps {
  onOpenHistory?: () => void;
}

/**
 * Детальный виджет баланса для личного кабинета
 */
export function BalanceWidget({ onOpenHistory }: BalanceWidgetProps) {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/user/balance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  const total = parseFloat(balance.total);
  const regular = parseFloat(balance.balance);
  const bonus = parseFloat(balance.bonusBalance);
  const hasBonus = bonus > 0;
  const bonusExpiring = balance.bonusExpiresAt && new Date(balance.bonusExpiresAt) > new Date();
  const isNegative = total < 0;

  return (
    <div className={`rounded-2xl p-6 border shadow-sm ${
      isNegative 
        ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' 
        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
    }`}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`rounded-full p-2 ${
            isNegative ? 'bg-red-600' : 'bg-amber-600'
          }`}>
            <Coins className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isNegative ? 'Долг по баллам' : 'Мои баллы'}
          </h3>
        </div>
        
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isNegative 
                ? 'text-red-700 hover:text-red-800' 
                : 'text-amber-700 hover:text-amber-800'
            }`}
          >
            <History className="w-4 h-4" />
            История
          </button>
        )}
      </div>

      {/* Общий баланс */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-1">
          {isNegative ? 'Долг по баллам' : 'Всего баллов'}
        </div>
        <div className={`text-4xl font-bold ${
          isNegative ? 'text-red-600' : 'text-gray-900'
        }`}>
          {formatPoints(total)}
        </div>
      </div>

      {/* Разбивка */}
      <div className="grid grid-cols-2 gap-4">
        {/* Обычные баллы */}
        <div className="bg-white rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-gray-600" />
            <div className="text-xs text-gray-600">Основные</div>
          </div>
          <div className="text-xl font-semibold text-gray-900">
            {formatPoints(regular)}
          </div>
        </div>

        {/* Бонусные баллы */}
        <div className="bg-white rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-amber-600" />
            <div className="text-xs text-amber-700">Бонусные</div>
          </div>
          <div className="text-xl font-semibold text-amber-900">
            {formatPoints(bonus)}
          </div>
        </div>
      </div>

      {/* Предупреждение об отрицательном балансе */}
      {isNegative && (
        <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-900">
            <span className="font-medium">У вас долг по баллам. </span>
            <span>Пополните баланс для продолжения работы с платформой.</span>
          </div>
        </div>
      )}

      {/* Предупреждение о сгорании бонусов */}
      {hasBonus && bonusExpiring && (
        <div className="mt-4 bg-amber-100 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
          <Clock className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-900">
            <span className="font-medium">Бонусные баллы сгорают через </span>
            <span className="font-bold">
              {formatTimeUntilExpiry(balance.bonusExpiresAt!)}
            </span>
          </div>
        </div>
      )}

      {/* Подсказка */}
      <div className="mt-4 text-xs text-gray-600 text-center">
        Баллы можно использовать для покупки услуг специалистов
      </div>
    </div>
  );
}

