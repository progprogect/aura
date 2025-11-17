/**
 * Виджет лимитов для дашборда специалиста
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, MessageSquare, Package, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LimitsData {
  totalBalance: number
  contactViewsAvailable: number
  requestsAvailable: number
  isVisible: boolean
}

interface LimitsWidgetProps {
  specialistId: string
}

export function LimitsWidget({ specialistId }: LimitsWidgetProps) {
  const [limits, setLimits] = useState<LimitsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLimits()
  }, [specialistId])

  const fetchLimits = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/specialist/packages')
      if (!response.ok) {
        throw new Error('Ошибка загрузки лимитов')
      }

      const data = await response.json()
      setLimits(data.currentLimits)
    } catch (err) {
      console.error('Ошибка загрузки лимитов:', err)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (error || !limits) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">Ошибка загрузки лимитов</p>
          <Button onClick={fetchLimits} variant="outline" size="sm">
            Повторить
          </Button>
        </div>
      </Card>
    )
  }

  const isLowBalance = limits.totalBalance < 20
  const isOutOfBalance = limits.totalBalance === 0

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Мои лимиты</h3>
      </div>

      <div className="space-y-4">
        {/* Общий баланс */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Баланс баллов</span>
            </div>
            <span className={`text-2xl font-bold ${isOutOfBalance ? 'text-red-600' : isLowBalance ? 'text-yellow-600' : 'text-green-600'}`}>
              {limits.totalBalance}
            </span>
          </div>
        </div>

        {/* Доступные лимиты */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-1">Просмотры контактов</div>
            <div className="text-xl font-bold text-blue-600">{limits.contactViewsAvailable}</div>
            <div className="text-xs text-gray-500">1 балл = 1 просмотр</div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <MessageSquare className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-1">Заявки от клиентов</div>
            <div className="text-xl font-bold text-purple-600">{limits.requestsAvailable}</div>
            <div className="text-xs text-gray-500">10 баллов = 1 заявка</div>
          </div>
        </div>

        {/* Предупреждения */}
        {isOutOfBalance && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Профиль скрыт</h4>
                <p className="text-sm text-red-700 mb-3">
                  У вас закончились баллы. Профиль не отображается в каталоге и поиске.
                </p>
                <Link href="/specialist/packages">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Пополнить баланс
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {isLowBalance && !isOutOfBalance && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Низкий баланс</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  У вас осталось мало баллов. Рекомендуем пополнить баланс.
                </p>
                <Link href="/specialist/packages">
                  <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                    Пополнить баланс
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Кнопка пополнения */}
        {!isOutOfBalance && (
          <Link href="/specialist/packages" className="block">
            <Button className="w-full" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Купить баллы
            </Button>
          </Link>
        )}
      </div>
    </Card>
  )
}
