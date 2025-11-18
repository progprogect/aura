/**
 * Список покупок пользователя
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { ReviewModal } from '@/components/reviews/ReviewModal'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, CheckCircle, XCircle, AlertTriangle, ShoppingCart, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Order {
  id: string
  status: string
  clientName: string
  clientContact: string
  clientMessage?: string
  pointsUsed: number
  pointsFrozen: boolean
  autoConfirmAt?: string
  completedAt?: string
  disputedAt?: string
  disputeReason?: string
  resultScreenshot?: string
  resultDescription?: string
  createdAt: string
  service: {
    id: string
    title: string
    emoji: string
    slug: string
    price: number
  }
  specialistProfile: {
    slug: string
    user: {
      firstName: string
      lastName: string
      avatar?: string
    }
  }
  review?: {
    id: string
  }
}

interface PurchasesResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    total: number
    paid: number
    completed: number
    cancelled: number
    disputed: number
  }
}

const STATUS_CONFIG = {
  paid: {
    label: 'Оплачен',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
  },
  in_progress: {
    label: 'В работе',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
  },
  pending_completion: {
    label: 'Ожидает подтверждения',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
  },
  completed: {
    label: 'Завершен',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Отменен',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  disputed: {
    label: 'Спор',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertTriangle,
  },
}

export function PurchasesList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<PurchasesResponse['stats']>({ total: 0, paid: 0, completed: 0, cancelled: 0, disputed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null)

  useEffect(() => {
    fetchPurchases()
  }, [activeTab])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (activeTab !== 'all') {
        params.append('status', activeTab)
      }

      const response = await fetch(`/api/user/purchases?${params}`)
      if (response.ok) {
        const data: PurchasesResponse = await response.json()
        setOrders(data.orders)
        setStats(data.stats)
      } else {
        setError('Ошибка загрузки покупок')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setError('Произошла ошибка при загрузке')
    } finally {
      setLoading(false)
    }
  }

  const handleDisputeClick = (orderId: string) => {
    setDisputeOrderId(orderId)
    setShowDisputeDialog(true)
  }

  const handleDispute = async () => {
    if (!disputeOrderId || !disputeReason.trim()) {
      setErrorMessage('Укажите причину спора')
      return
    }

    try {
      const response = await fetch(`/api/orders/${disputeOrderId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: disputeReason.trim() })
      })

      if (response.ok) {
        // Обновляем список
        fetchPurchases()
        setShowDisputeDialog(false)
        setDisputeOrderId(null)
        setDisputeReason('')
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Ошибка создания спора')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setErrorMessage('Произошла ошибка при создании спора')
    }
  }

  const handleConfirmOrder = async (orderId: string) => {
    setConfirmingOrderId(orderId)

    try {
      const response = await fetch(`/api/orders/${orderId}/confirm`, {
        method: 'PATCH'
      })

      const data = await response.json()

      if (data.success) {
        // Обновляем список
        fetchPurchases()
        
        // Если требуется отзыв, показываем модальное окно
        if (data.requiresReview) {
          setReviewOrderId(orderId)
          setShowReviewModal(true)
        }
      } else {
        setErrorMessage(data.error || 'Ошибка подтверждения заказа')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setErrorMessage('Произошла ошибка при подтверждении заказа')
    } finally {
      setConfirmingOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchPurchases} className="mt-4">
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Покупок пока нет
          </h3>
          <p className="text-gray-600 mb-6">
            Закажите услуги у наших специалистов и отслеживайте их здесь
          </p>
          <Button asChild>
            <a href="/specialists">Найти специалистов</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Всего заказов</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.paid}</div>
            <div className="text-sm text-gray-600">В работе</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Завершено</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.disputed}</div>
            <div className="text-sm text-gray-600">Споры</div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Все', count: stats.total },
            { value: 'paid', label: 'В работе', count: stats.paid },
            { value: 'completed', label: 'Завершено', count: stats.completed },
            { value: 'cancelled', label: 'Отменено', count: stats.cancelled },
            { value: 'disputed', label: 'Споры', count: stats.disputed }
          ].map(tab => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.value)}
              className="text-xs"
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]
            const StatusIcon = statusConfig?.icon || Clock

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{order.service.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.service.title}</h3>
                        <p className="text-sm text-gray-600">
                          {order.specialistProfile.user.firstName} {order.specialistProfile.user.lastName}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig?.label || order.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Стоимость</p>
                      <p className="font-semibold">{order.pointsUsed} баллов</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Заказано</p>
                      <p className="font-semibold">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: ru })}
                      </p>
                    </div>
                  </div>

                  {order.status === 'paid' && order.autoConfirmAt && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⏰ Автоматическое подтверждение через{' '}
                        {formatDistanceToNow(new Date(order.autoConfirmAt), { locale: ru })}
                      </p>
                    </div>
                  )}

                  {order.resultDescription && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">Результат работы:</p>
                      <p className="text-sm text-green-700">{order.resultDescription}</p>
                      {order.resultScreenshot && (
                        <a
                          href={order.resultScreenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 underline mt-1 inline-block"
                        >
                          Посмотреть скриншот →
                        </a>
                      )}
                    </div>
                  )}

                  {order.disputeReason && (
                    <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-800 mb-1">Причина спора:</p>
                      <p className="text-sm text-orange-700">{order.disputeReason}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'pending_completion' && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmOrder(order.id)}
                        disabled={confirmingOrderId === order.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {confirmingOrderId === order.id ? 'Подтверждаем...' : 'Подтвердить выполнение'}
                      </Button>
                    )}
                    
                    {order.status === 'completed' && !order.review && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setReviewOrderId(order.id)
                          setShowReviewModal(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Оставить отзыв
                      </Button>
                    )}
                    
                    {(order.status === 'paid' || order.status === 'completed' || order.status === 'in_progress') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisputeClick(order.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        Оспорить
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/specialist/${order.specialistProfile.slug}`}>
                        Профиль специалиста
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Модальное окно спора */}
      <Dialog
        isOpen={showDisputeDialog}
        onClose={() => {
          setShowDisputeDialog(false)
          setDisputeOrderId(null)
          setDisputeReason('')
        }}
        title="Открыть спор"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDisputeDialog(false)
                setDisputeOrderId(null)
                setDisputeReason('')
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleDispute}
              disabled={!disputeReason.trim()}
              variant="destructive"
            >
              Открыть спор
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Опишите проблему с заказом. Администратор рассмотрит спор в течение 24 часов.
          </p>
          <Textarea
            placeholder="Опишите проблему..."
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            rows={4}
          />
        </div>
      </Dialog>

      {/* Модальное окно ошибки */}
      {errorMessage && (
        <Dialog
          isOpen={!!errorMessage}
          onClose={() => setErrorMessage(null)}
          title="Ошибка"
          footer={
            <Button onClick={() => setErrorMessage(null)}>
              Закрыть
            </Button>
          }
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </Dialog>
      )}

      {/* Модальное окно отзыва */}
      {reviewOrderId && (
        <ReviewModal
          orderId={reviewOrderId}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false)
            setReviewOrderId(null)
          }}
          onSuccess={() => {
            setShowReviewModal(false)
            setReviewOrderId(null)
            fetchPurchases()
          }}
        />
      )}
    </div>
  )
}
