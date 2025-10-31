/**
 * Список заказов услуг специалиста
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, MessageSquare, Clock, Package, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getOrderStatusLabel, getOrderStatusColor, isOrderOverdue } from '@/lib/services/utils'
import type { OrderUI } from '@/types/service'

interface OrdersListProps {
  orders: OrderUI[]
}

export function OrdersList({ orders: initialOrders }: OrdersListProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null)
  const [completeForm, setCompleteForm] = useState({
    screenshot: null as File | null,
    description: ''
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    
    try {
      const response = await fetch(`/api/specialist/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        // Обновляем локальное состояние
        setOrders(prev => 
          prev.map(o => o.id === id ? { ...o, status: status as any } : o)
        )
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Ошибка обновления статуса')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setErrorMessage('Ошибка обновления статуса')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    if (!completeForm.screenshot || !completeForm.description.trim()) {
      setErrorMessage('Нужно загрузить скриншот и описание')
      return
    }

    setUpdatingId(orderId)

    try {
      const formData = new FormData()
      formData.append('screenshot', completeForm.screenshot)
      formData.append('description', completeForm.description)

      const response = await fetch(`/api/orders/${orderId}/complete`, {
        method: 'PATCH',
        body: formData
      })

      if (response.ok) {
        // Обновляем локальное состояние
        setOrders(prev => 
          prev.map(o => o.id === orderId ? { 
            ...o, 
            status: 'completed' as any,
            completedAt: new Date(),
            resultScreenshot: 'uploaded',
            resultDescription: completeForm.description
          } : o)
        )
        
        // Сбрасываем форму
        setCompleteForm({ screenshot: null, description: '' })
        setCompletingOrderId(null)
        setSuccessMessage('Работа завершена! Ожидайте подтверждения от пользователя.')
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Ошибка завершения заказа')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setErrorMessage('Ошибка завершения заказа')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatRelativeTime = (date: Date) => {
    const now = Date.now()
    const created = new Date(date).getTime()
    const diff = now - created
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    if (days === 1) return 'вчера'
    return `${days} дн назад`
  }

  const formatDeadline = (deadline: Date | null) => {
    if (!deadline) return null
    
    const date = new Date(deadline)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / 86400000)
    
    if (days < 0) return `Просрочено на ${Math.abs(days)} дн`
    if (days === 0) return 'Сегодня'
    if (days === 1) return 'Завтра'
    return `Осталось ${days} дн`
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Пока нет заказов
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Заказы услуг от клиентов будут появляться здесь. 
          Создайте услуги в настройках профиля, чтобы получать заказы.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => {
        const isPending = order.status === 'pending'
        const isPaid = order.status === 'paid'
        const inProgress = order.status === 'in_progress'
        const overdue = isOrderOverdue(order.deadline, order.status as any)

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              bg-white rounded-lg p-6
              ${isPaid ? 'border-2 border-green-300 shadow-md' : 'border-2 border-gray-200 shadow-sm'}
            `}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${isPaid ? 'bg-green-100' : isPending ? 'bg-yellow-100' : 'bg-blue-100'}
                `}>
                  <Package className={`
                    w-6 h-6 
                    ${isPaid ? 'text-green-600' : isPending ? 'text-yellow-600' : 'text-blue-600'}
                  `} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {order.clientName}
                    </h3>
                    <Badge 
                      variant={isPaid ? 'default' : 'secondary'}
                      className={getOrderStatusColor(order.status as any, 'badge')}
                    >
                      {getOrderStatusLabel(order.status as any)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {formatRelativeTime(order.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Услуга */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-blue-600 font-medium mb-1">Услуга:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{order.service?.emoji}</span>
                  <p className="font-semibold text-gray-900">{order.service?.title}</p>
                </div>
                {isPaid && order.amountPaid && (
                  <p className="text-lg font-bold text-green-700">
                    {order.amountPaid} BYN
                  </p>
                )}
              </div>
            </div>

            {/* Deadline (если есть) */}
            {order.deadline && inProgress && (
              <div className={`
                p-3 rounded-lg mb-4 flex items-center gap-2
                ${overdue ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}
              `}>
                {overdue && <AlertCircle className="w-4 h-4 text-red-600" />}
                <p className={`text-sm font-medium ${overdue ? 'text-red-700' : 'text-gray-700'}`}>
                  ⏱️ Срок: {formatDeadline(order.deadline)}
                </p>
              </div>
            )}

            {/* Контакт */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-medium">Телефон</p>
                <p className="text-sm font-medium text-gray-900">{order.clientContact}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.clientContact)
                }}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-600"
                title="Копировать"
              >
                📋
              </button>
            </div>

            {/* Сообщение */}
            {order.clientMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Сообщение от клиента:
                </p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {order.clientMessage}
                </p>
              </div>
            )}

            {/* Действия */}
            <div className="flex gap-2 flex-wrap">
              {isPending && (
                <>
                  <Button
                    onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                    disabled={updatingId === order.id}
                    size="sm"
                    className="gap-2"
                  >
                    🚀 Начать работу
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                    disabled={updatingId === order.id}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    Отменить
                  </Button>
                </>
              )}

              {(isPaid || inProgress) && (
                <>
                  {isPaid && (
                    <Button
                      onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                      disabled={updatingId === order.id}
                      size="sm"
                      className="gap-2"
                    >
                      🚀 Начать работу
                    </Button>
                  )}
                  {inProgress && (
                    <Button
                      onClick={() => setCompletingOrderId(order.id)}
                      disabled={updatingId === order.id}
                      size="sm"
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      ✅ Завершить
                    </Button>
                  )}
                  <Button
                    onClick={() => handleUpdateStatus(order.id, 'disputed')}
                    disabled={updatingId === order.id}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    ⚠️ Открыть спор
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )
      })}

      {/* Модальное окно завершения заказа */}
      {completingOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Завершить заказ
            </h3>
            
            <div className="space-y-4">
              {/* Загрузка скриншота */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Скриншот результата *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCompleteForm(prev => ({ 
                    ...prev, 
                    screenshot: e.target.files?.[0] || null 
                  }))}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание выполненной работы *
                </label>
                <textarea
                  value={completeForm.description}
                  onChange={(e) => setCompleteForm(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Опишите что было сделано..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => {
                  setCompletingOrderId(null)
                  setCompleteForm({ screenshot: null, description: '' })
                }}
                variant="outline"
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={() => handleCompleteOrder(completingOrderId)}
                disabled={updatingId === completingOrderId || !completeForm.screenshot || !completeForm.description.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {updatingId === completingOrderId ? 'Завершение...' : 'Завершить заказ'}
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {/* Модальное окно успеха */}
      {successMessage && (
        <Dialog
          isOpen={!!successMessage}
          onClose={() => setSuccessMessage(null)}
          title="Успешно"
          footer={
            <Button onClick={() => setSuccessMessage(null)}>
              Закрыть
            </Button>
          }
        >
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        </Dialog>
      )}
    </div>
  )
}

