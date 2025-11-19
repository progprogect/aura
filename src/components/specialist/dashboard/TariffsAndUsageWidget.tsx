/**
 * Виджет тарифов и расходов для дашборда специалиста
 * Отображает систему монетизации: тарифы операций, текущий баланс и доступные действия
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, MessageSquare, CreditCard, AlertCircle, Plus, Coins } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LimitsData {
  totalBalance: number
  contactViewsAvailable: number
  requestsAvailable: number
  isVisible: boolean
}

interface TariffsAndUsageWidgetProps {
  specialistId: string
}

interface TariffOperation {
  id: string
  name: string
  icon: typeof Eye
  cost: number
  costLabel: string
  available: number
  color: 'blue' | 'purple'
}

export function TariffsAndUsageWidget({ specialistId }: TariffsAndUsageWidgetProps) {
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
        throw new Error('Ошибка загрузки данных')
      }

      const data = await response.json()
      setLimits(data.currentLimits)
    } catch (err) {
      console.error('Ошибка загрузки тарифов:', err)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !limits) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">Ошибка загрузки данных</p>
            <Button onClick={fetchLimits} variant="outline" size="sm">
              Повторить
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isLowBalance = limits.totalBalance > 0 && limits.totalBalance <= 20
  const isOutOfBalance = limits.totalBalance <= 0

  // Определяем цвет баланса
  const balanceColorClass = isOutOfBalance
    ? 'text-red-600'
    : isLowBalance
    ? 'text-yellow-600'
    : 'text-green-600'

  const balanceBgClass = isOutOfBalance
    ? 'bg-gradient-to-br from-red-50 to-orange-50'
    : isLowBalance
    ? 'bg-gradient-to-br from-yellow-50 to-amber-50'
    : 'bg-gradient-to-br from-blue-50 to-purple-50'

  // Конфигурация операций
  const operations: TariffOperation[] = [
    {
      id: 'contact-view',
      name: 'Просмотр контактов',
      icon: Eye,
      cost: 1,
      costLabel: '1 балл',
      available: limits.contactViewsAvailable,
      color: 'blue',
    },
    {
      id: 'request',
      name: 'Получение заявки',
      icon: MessageSquare,
      cost: 10,
      costLabel: '10 баллов',
      available: limits.requestsAvailable,
      color: 'purple',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-blue-600" />
            💳 Тарифы и расходы
          </CardTitle>
          <CardDescription>Как работает система списания баллов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Блок баланса */}
          <div
            className={`rounded-xl p-4 md:p-5 ${balanceBgClass} border ${
              isOutOfBalance
                ? 'border-red-200'
                : isLowBalance
                ? 'border-yellow-200'
                : 'border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className={`h-5 w-5 ${balanceColorClass}`} />
                <span className="text-sm md:text-base font-medium text-gray-700">
                  Текущий баланс
                </span>
              </div>
              <span className={`text-2xl md:text-3xl font-bold ${balanceColorClass}`}>
                {limits.totalBalance}
              </span>
            </div>
          </div>

          {/* Таблица тарифов - Мобильная версия (карточки) */}
          <div className="md:hidden space-y-3">
            {operations.map((operation) => {
              const Icon = operation.icon
              const bgColor = operation.color === 'blue' ? 'bg-blue-50' : 'bg-purple-50'
              const textColor = operation.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
              const borderColor = operation.color === 'blue' ? 'border-blue-200' : 'border-purple-200'

              return (
                <div
                  key={operation.id}
                  className={`${bgColor} rounded-lg p-3 border ${borderColor}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Icon className={`h-5 w-5 ${textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {operation.name}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          Стоимость: <span className="font-semibold">{operation.costLabel}</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          Доступно: <span className={`font-semibold ${textColor}`}>
                            {operation.available >= 0 ? operation.available : 0}
                          </span>{' '}
                          {operation.id === 'contact-view' ? 'просмотров' : 'заявок'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Таблица тарифов - Десктоп версия */}
          <div className="hidden md:block">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Операция
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Стоимость
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Доступно сейчас
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {operations.map((operation, index) => {
                    const Icon = operation.icon
                    const textColor = operation.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                    const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50'

                    return (
                      <tr key={operation.id} className={bgColor}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-5 w-5 ${textColor}`} />
                            <span className="text-sm font-medium text-gray-900">
                              {operation.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{operation.costLabel}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${textColor}`}>
                            {operation.available >= 0 ? operation.available : 0}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            {operation.id === 'contact-view' ? 'просмотров' : 'заявок'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-red-800 mb-1 text-sm md:text-base">
                    Профиль скрыт
                  </h4>
                  <p className="text-sm text-red-700 mb-3">
                    У вас закончились баллы. Профиль не отображается в каталоге и поиске.
                  </p>
                  <Link href="/specialist/packages" className="block">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
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
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-yellow-800 mb-1 text-sm md:text-base">
                    Низкий баланс
                  </h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Осталось мало баллов. Рекомендуем пополнить баланс.
                  </p>
                  <Link href="/specialist/packages" className="block">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 w-full sm:w-auto"
                    >
                      Пополнить баланс
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Кнопка пополнения (если баланс > 0) */}
          {!isOutOfBalance && (
            <Link href="/specialist/packages" className="block">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Пополнить баланс
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

