/**
 * Компонент текущих лимитов
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, MessageSquare, Package, CheckCircle, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LimitsData {
  totalBalance: number
  contactViewsAvailable: number
  requestsAvailable: number
  isVisible: boolean
}

interface CurrentLimitsProps {
  specialistId: string
}

export function CurrentLimits({ specialistId }: CurrentLimitsProps) {
  const [limits, setLimits] = useState<LimitsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLimits()
  }, [specialistId])

  const fetchLimits = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/specialist/packages')
      if (!response.ok) {
        throw new Error('Ошибка загрузки лимитов')
      }
      const data = await response.json()
      setLimits(data.currentLimits)
    } catch (error) {
      console.error('Ошибка загрузки лимитов:', error)
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
          </div>
        </div>
      </Card>
    )
  }

  if (!limits) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          Ошибка загрузки лимитов
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 sticky top-8">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Текущие лимиты
        </h2>
        {limits.isVisible ? (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Профиль виден
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Профиль скрыт
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {/* Общий баланс */}
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {limits.totalBalance}
          </div>
          <div className="text-gray-600">баллов</div>
        </div>

        {/* Детали лимитов */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Просмотры контактов</span>
            </div>
            <span className="text-xl font-bold text-blue-600">
              {limits.contactViewsAvailable}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Заявки от клиентов</span>
            </div>
            <span className="text-xl font-bold text-purple-600">
              {limits.requestsAvailable}
            </span>
          </div>
        </div>

        {/* Информация о расходах */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Как расходуются баллы:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>1 просмотр контакта</span>
              <span className="font-medium">1 балл</span>
            </div>
            <div className="flex justify-between">
              <span>1 заявка от клиента</span>
              <span className="font-medium">10 баллов</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
