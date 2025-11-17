/**
 * Компонент для отображения статистики комиссий
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, TrendingUp, Gift, DollarSign } from 'lucide-react'

interface RevenueStatsProps {
  totalCommission: number
  totalCashback: number
  totalNetRevenue: number
  totalTransactions: number
  byType: {
    leadMagnet: {
      commission: number
      cashback: number
      netRevenue: number
      count: number
    }
    service: {
      commission: number
      cashback: number
      netRevenue: number
      count: number
    }
  }
}

export function RevenueStats({
  totalCommission,
  totalCashback,
  totalNetRevenue,
  totalTransactions,
  byType,
}: RevenueStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Общая комиссия */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Общая комиссия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <div className="text-2xl font-bold text-gray-900">
              {totalCommission.toFixed(2)}
            </div>
            <span className="text-sm text-gray-500">баллов</span>
          </div>
        </CardContent>
      </Card>

      {/* Общий кешбэк */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Общий кешбэк
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-600" />
            <div className="text-2xl font-bold text-gray-900">
              {totalCashback.toFixed(2)}
            </div>
            <span className="text-sm text-gray-500">баллов</span>
          </div>
        </CardContent>
      </Card>

      {/* Чистая прибыль */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Чистая прибыль
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <div className="text-2xl font-bold text-gray-900">
              {totalNetRevenue.toFixed(2)}
            </div>
            <span className="text-sm text-gray-500">баллов</span>
          </div>
        </CardContent>
      </Card>

      {/* Всего транзакций */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">
            Всего транзакций
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-purple-600" />
            <div className="text-2xl font-bold text-gray-900">
              {totalTransactions}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* По типам */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            По типам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Лид-магниты</div>
              <div className="text-lg font-semibold text-gray-900">
                {byType.leadMagnet.count} транзакций
              </div>
              <div className="text-sm text-gray-600">
                Комиссия: {byType.leadMagnet.commission.toFixed(2)} баллов
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Услуги</div>
              <div className="text-lg font-semibold text-gray-900">
                {byType.service.count} транзакций
              </div>
              <div className="text-sm text-gray-600">
                Комиссия: {byType.service.commission.toFixed(2)} баллов
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

