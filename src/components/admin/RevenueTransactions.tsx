/**
 * Компонент для отображения истории транзакций комиссий
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { formatPoints } from '@/lib/points/format'

interface PlatformRevenue {
  id: string
  type: string
  commissionAmount: number
  cashbackAmount: number
  netRevenue: number
  clientUserId: string
  specialistUserId?: string | null
  description?: string | null
  createdAt: string
  orderId?: string | null
  leadMagnetPurchaseId?: string | null
}

interface RevenueTransactionsProps {
  initialRevenues?: PlatformRevenue[]
  initialPagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function RevenueTransactions({
  initialRevenues = [],
  initialPagination,
}: RevenueTransactionsProps) {
  const [revenues, setRevenues] = useState<PlatformRevenue[]>(initialRevenues)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState(initialPagination)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!initialRevenues.length) {
      fetchTransactions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTransactions = async (pageNum = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/revenue/transactions?page=${pageNum}&limit=50`)
      const data = await response.json()

      if (response.ok && data.success) {
        setRevenues(data.revenues)
        setPagination(data.pagination)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Ошибка загрузки транзакций:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !revenues.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!revenues.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>История транзакций</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Нет транзакций
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>История транзакций</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {revenues.map((revenue) => (
            <div
              key={revenue.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {revenue.description || 'Комиссия'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {revenue.type === 'commission' ? 'Комиссия' : revenue.type}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(revenue.createdAt), 'dd.MM.yyyy HH:mm')}
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-sm font-semibold text-gray-900">
                  Комиссия: {formatPoints(revenue.commissionAmount)}
                </div>
                <div className="text-xs text-gray-500">
                  Кешбэк: {formatPoints(revenue.cashbackAmount)}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  Прибыль: {formatPoints(revenue.netRevenue)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Страница {pagination.page} из {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchTransactions(page - 1)}
                disabled={page === 1 || loading}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Назад
              </button>
              <button
                onClick={() => fetchTransactions(page + 1)}
                disabled={page === pagination.totalPages || loading}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

