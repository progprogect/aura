'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Gift, Clock, BookOpen, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPoints, formatTimeUntilExpiry, getBonusExpiryProgress } from '@/lib/points/format';
import { UserBalance } from '@/types/points';

interface PointsUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно с информацией о том, как использовать баллы
 * Мобильный: Bottom Sheet, Десктоп: Центрированная модалка
 */
export function PointsUsageModal({ isOpen, onClose }: PointsUsageModalProps) {
  const router = useRouter();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
    } else {
      // Сбрасываем состояние при закрытии для свежих данных при следующем открытии
      setBalance(null);
      setLoading(false);
    }
  }, [isOpen]);

  const fetchBalance = async () => {
    setLoading(true);
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

  const handleGoToLibrary = () => {
    router.push('/library');
    onClose();
  };

  const handleGoToCatalog = () => {
    router.push('/catalog');
    onClose();
  };

  const total = balance ? parseFloat(balance.total) : 0;
  const regular = balance ? parseFloat(balance.balance) : 0;
  const bonus = balance ? parseFloat(balance.bonusBalance) : 0;
  const hasBonus = bonus > 0;
  const bonusExpiring = balance?.bonusExpiresAt && new Date(balance.bonusExpiresAt) > new Date();
  const progress = balance?.bonusExpiresAt ? getBonusExpiryProgress(balance.bonusExpiresAt) : 0;
  const daysUntilExpiry = balance?.bonusExpiresAt 
    ? Math.ceil((new Date(balance.bonusExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isUrgent = daysUntilExpiry > 0 && daysUntilExpiry <= 3;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Как использовать баллы"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : !balance ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Не удалось загрузить баланс</p>
          <Button
            onClick={fetchBalance}
            variant="outline"
            size="sm"
          >
            Попробовать снова
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Текущий баланс */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-full p-2 bg-amber-600">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Всего баллов</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPoints(total)}
                  </div>
                </div>
              </div>
            </div>

            {/* Разбивка баланса */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white rounded-lg p-3 border border-amber-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Coins className="w-3.5 h-3.5 text-gray-600" />
                  <div className="text-xs text-gray-600">Основные</div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPoints(regular)}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-amber-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <div className="text-xs text-amber-700">Бонусные</div>
                </div>
                <div className="text-lg font-semibold text-amber-900">
                  {formatPoints(bonus)}
                </div>
              </div>
            </div>

            {/* Прогресс-бар сгорания бонусов */}
            {hasBonus && bonusExpiring && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-700 font-medium">
                    Бонусные баллы сгорают через {formatTimeUntilExpiry(balance.bonusExpiresAt!)}
                  </span>
                  <span className="text-amber-600">{progress}%</span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isUrgent ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {isUrgent && (
                  <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Используйте бонусные баллы в первую очередь — они сгорят скоро!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Куда потратить */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Куда потратить баллы
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Полезные материалы */}
              <Card className="border-2 hover:border-amber-300 transition-colors cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-full p-2 bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-base">Полезные материалы от экспертов</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Гайды, чек-листы, программы и другие материалы от проверенных специалистов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleGoToLibrary}
                    className="w-full min-h-[44px]"
                    size="lg"
                  >
                    Перейти в библиотеку
                  </Button>
                </CardContent>
              </Card>

              {/* Услуги экспертов */}
              <Card className="border-2 hover:border-amber-300 transition-colors cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-full p-2 bg-purple-100 group-hover:bg-purple-200 transition-colors">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-base">Услуги экспертов и компаний</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    Консультации, программы, курсы и другие услуги от специалистов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleGoToCatalog}
                    variant="outline"
                    className="w-full min-h-[44px]"
                    size="lg"
                  >
                    Перейти в каталог
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Подсказка */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <span className="font-medium">Важно:</span> Бонусные баллы сгорают через 7 дней после получения. Используйте их первыми при покупке — система автоматически списывает их в первую очередь.
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}

