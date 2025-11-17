/**
 * Модальное окно подтверждения покупки лид-магнита
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Coins, AlertCircle, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LeadMagnetUI } from '@/types/lead-magnet'
import Link from 'next/link'

interface PurchaseConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  leadMagnet: Pick<LeadMagnetUI, 'id' | 'title' | 'description' | 'emoji' | 'priceInPoints'>
  onSuccess: (accessUrl: string) => void
}

interface UserBalance {
  balance: string
  bonusBalance: string
  total: string
  bonusExpiresAt?: string | null
}

export function PurchaseConfirmModal({
  isOpen,
  onClose,
  leadMagnet,
  onSuccess,
}: PurchaseConfirmModalProps) {
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const priceInPoints = leadMagnet.priceInPoints || 0
  
  // Расчет кешбэка (2.5% от суммы) - точный расчет без округления
  const calculateCashback = (amount: number): number => {
    const commission = amount * 0.05 // 5% комиссия
    const cashback = commission * 0.5 // 50% от комиссии = 2.5% от суммы
    return cashback // Без округления - точное значение
  }
  
  const cashbackAmount = priceInPoints > 0 ? calculateCashback(priceInPoints) : 0

  // Загружаем баланс при открытии модалки
  useEffect(() => {
    if (isOpen) {
      fetchBalance()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const fetchBalance = async () => {
    setLoadingBalance(true)
    setError(null)
    try {
      const response = await fetch('/api/user/balance')
      if (response.ok) {
        const data = await response.json()
        setBalance(data)
      } else {
        setError('Не удалось загрузить баланс')
      }
    } catch (error) {
      console.error('Ошибка загрузки баланса:', error)
      setError('Ошибка загрузки баланса')
    } finally {
      setLoadingBalance(false)
    }
  }

  const handlePurchase = async () => {
    if (!balance) return

    const totalBalance = parseFloat(balance.total)
    if (totalBalance < priceInPoints) {
      setError('Недостаточно баллов')
      return
    }

    setIsPurchasing(true)
    setError(null)

    try {
      const response = await fetch(`/api/lead-magnets/${leadMagnet.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Обновляем баланс
        await fetchBalance()
        // Открываем доступ
        onSuccess(data.accessUrl)
        onClose()
      } else {
        if (data.code === 'INSUFFICIENT_POINTS') {
          setError(`Недостаточно баллов. Нужно: ${data.required}, доступно: ${data.available}`)
        } else {
          setError(data.error || 'Ошибка покупки')
        }
      }
    } catch (error) {
      console.error('Ошибка покупки:', error)
      setError('Произошла ошибка при покупке')
    } finally {
      setIsPurchasing(false)
    }
  }

  if (!isOpen) return null

  const totalBalance = balance ? parseFloat(balance.total) : 0
  const regularBalance = balance ? parseFloat(balance.balance) : 0
  const bonusBalance = balance ? parseFloat(balance.bonusBalance) : 0
  const hasEnoughBalance = totalBalance >= priceInPoints

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative z-10 w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{leadMagnet.emoji}</span>
                <h2 className="text-lg font-semibold text-gray-900">
                  {leadMagnet.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {leadMagnet.description}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Цена */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-900">Стоимость:</span>
                <span className="text-xl font-bold text-amber-900 flex items-center gap-1">
                  <Coins className="w-5 h-5" />
                  {priceInPoints} баллов
                </span>
              </div>
              {cashbackAmount > 0 && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-amber-300">
                  <Gift className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700">
                    Кешбэк: <span className="font-semibold">{cashbackAmount.toFixed(2)}</span> баллов
                  </span>
                </div>
              )}
            </div>

            {/* Баланс */}
            {loadingBalance ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : balance ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Обычные баллы:</span>
                  <span className="font-medium text-gray-900">{regularBalance}</span>
                </div>
                {bonusBalance > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Бонусные баллы:</span>
                    <span className="font-medium text-green-600">{bonusBalance}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Итого:</span>
                    <span className={`text-lg font-bold ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                      {totalBalance} баллов
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Предупреждение о недостатке баллов */}
            {!loadingBalance && balance && !hasEnoughBalance && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 mb-1">
                      Недостаточно баллов
                    </p>
                    <p className="text-xs text-red-700 mb-2">
                      Для покупки нужно {priceInPoints} баллов, у вас {totalBalance}
                    </p>
                    <Link
                      href="/profile"
                      className="text-xs text-red-600 underline hover:text-red-700"
                      onClick={onClose}
                    >
                      Пополнить баланс
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Ошибка */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPurchasing}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || !hasEnoughBalance || loadingBalance}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                size="lg"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Coins size={18} />
                    Подтвердить покупку
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

