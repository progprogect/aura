'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Gift, Clock, History, Loader2, AlertTriangle, BookOpen, Briefcase, HelpCircle } from 'lucide-react';
import { formatPoints, formatTimeUntilExpiry, getBonusExpiryProgress } from '@/lib/points/format';
import { UserBalance } from '@/types/points';
import { Button } from '@/components/ui/button';

interface BalanceWidgetProps {
  onOpenHistory?: () => void;
  onOpenUsageModal?: () => void;
}

/**
 * Детальный виджет баланса для личного кабинета
 */
export function BalanceWidget({ onOpenHistory, onOpenUsageModal }: BalanceWidgetProps) {
  const router = useRouter();
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
  const progress = balance.bonusExpiresAt ? getBonusExpiryProgress(balance.bonusExpiresAt) : 0;
  const daysUntilExpiry = balance.bonusExpiresAt 
    ? Math.ceil((new Date(balance.bonusExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isUrgent = daysUntilExpiry > 0 && daysUntilExpiry <= 3;
  const isNegative = total < 0;

  const handleGoToLibrary = () => {
    router.push('/library');
  };

  const handleGoToCatalog = () => {
    router.push('/catalog');
  };

  return (
    <div className={`rounded-2xl p-6 border shadow-sm ${
      isNegative 
        ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' 
        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
    }`}>
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`rounded-full p-2 flex-shrink-0 ${
          isNegative ? 'bg-red-600' : 'bg-amber-600'
        }`}>
          <Coins className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {isNegative ? 'Долг по баллам' : 'Мои баллы'}
        </h3>
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

      {/* Предупреждение о сгорании бонусов с прогресс-баром */}
      {hasBonus && bonusExpiring && (
        <div className={`mt-4 rounded-lg p-3 flex flex-col gap-2 ${
          isUrgent 
            ? 'bg-red-50 border-2 border-red-200' 
            : 'bg-amber-100 border border-amber-300'
        }`}>
          <div className="flex items-start gap-2">
            <Clock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              isUrgent ? 'text-red-700' : 'text-amber-700'
            }`} />
            <div className={`text-sm flex-1 ${
              isUrgent ? 'text-red-900' : 'text-amber-900'
            }`}>
              <span className="font-medium">Бонусные баллы сгорают через </span>
              <span className="font-bold">
                {formatTimeUntilExpiry(balance.bonusExpiresAt!)}
              </span>
            </div>
          </div>
          {/* Прогресс-бар */}
          <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isUrgent ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          {isUrgent && (
            <div className="text-xs text-red-700 font-medium">
              Используйте бонусные баллы в первую очередь!
            </div>
          )}
        </div>
      )}

      {/* Кнопки действий */}
      <div className="mt-4 space-y-2">
        <Button
          onClick={handleGoToLibrary}
          className="w-full min-h-[44px]"
          size="lg"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Полезные материалы
        </Button>
        <Button
          onClick={handleGoToCatalog}
          variant="outline"
          className="w-full min-h-[44px]"
          size="lg"
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Услуги экспертов
        </Button>
      </div>

      {/* Подсказка */}
      <div className="mt-4 text-xs text-gray-600 text-center">
        Баллы можно потратить на полезные материалы и услуги экспертов
      </div>

      {/* Вспомогательные ссылки */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-4 flex-wrap">
        {onOpenUsageModal && (
          <button
            onClick={onOpenUsageModal}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors min-h-[44px] px-3 py-2 rounded-lg hover:bg-white/50 ${
              isNegative 
                ? 'text-red-700 hover:text-red-800' 
                : 'text-amber-700 hover:text-amber-800'
            }`}
            aria-label="Как использовать баллы"
          >
            <HelpCircle className="w-4 h-4 flex-shrink-0" />
            <span>Как использовать?</span>
          </button>
        )}
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors min-h-[44px] px-3 py-2 rounded-lg hover:bg-white/50 ${
              isNegative 
                ? 'text-red-700 hover:text-red-800' 
                : 'text-amber-700 hover:text-amber-800'
            }`}
            aria-label="История транзакций"
          >
            <History className="w-4 h-4 flex-shrink-0" />
            <span>История</span>
          </button>
        )}
      </div>
    </div>
  );
}

