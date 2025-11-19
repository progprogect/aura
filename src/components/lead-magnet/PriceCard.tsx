/**
 * Унифицированная карточка цены для лид-магнитов
 * Красивый дизайн с индикатором баланса
 */

'use client'

import { Coins, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceCardProps {
  priceInPoints: number | null
  balance?: { total: string; balance: string; bonusBalance: string } | null
  isPurchased?: boolean
  className?: string
}

export function PriceCard({
  priceInPoints,
  balance,
  isPurchased = false,
  className
}: PriceCardProps) {
  const isPaid = typeof priceInPoints === 'number' && priceInPoints > 0
  const totalBalance = balance ? parseFloat(balance.total) : 0
  const hasEnoughBalance = totalBalance >= (priceInPoints || 0)

  // Если не платный и нет баланса - не показываем карточку
  if (!isPaid && !balance) return null

  // Если куплено - показываем бейдж успешной покупки
  if (isPurchased) {
    return (
      <div className={cn(
        "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 md:p-5",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 mb-0.5">
              Вы приобрели этот материал
            </p>
            <p className="text-xs text-green-700">
              Теперь у вас есть доступ
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Если платный - показываем цену и баланс
  if (isPaid) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Карточка цены */}
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-amber-900">
                Стоимость
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-amber-900">
                {priceInPoints}
              </div>
              <div className="text-xs text-amber-700 font-medium">
                баллов
              </div>
            </div>
          </div>
        </div>

        {/* Баланс пользователя (если авторизован) */}
        {balance && (
          <div className={cn(
            "bg-white border-2 rounded-lg p-3 md:p-4 transition-colors",
            hasEnoughBalance 
              ? "border-green-200 bg-green-50/50" 
              : "border-gray-200 bg-gray-50/50"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Ваш баланс:
              </span>
              <span className={cn(
                "text-base md:text-lg font-bold flex items-center gap-1.5",
                hasEnoughBalance ? "text-green-600" : "text-gray-900"
              )}>
                {hasEnoughBalance && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                {totalBalance.toFixed(0)} баллов
              </span>
            </div>
            {!hasEnoughBalance && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                Недостаточно баллов. Нужно пополнить баланс.
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Если бесплатный, но есть баланс - показываем только баланс
  if (balance) {
    return (
      <div className={cn(
        "bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4",
        className
      )}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Ваш баланс:</span>
          <span className="font-semibold text-gray-900">
            {totalBalance.toFixed(0)} баллов
          </span>
        </div>
      </div>
    )
  }

  return null
}

