/**
 * Список заявок на консультацию
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, MessageSquare, Clock, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ConsultationRequest {
  id: string
  name: string
  contact: string
  message: string | null
  status: string
  createdAt: Date
}

interface RequestsListProps {
  requests: ConsultationRequest[]
}

export function RequestsList({ requests: initialRequests }: RequestsListProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    
    try {
      const response = await fetch(`/api/specialist/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        // Обновляем локальное состояние
        setRequests(prev => 
          prev.map(r => r.id === id ? { ...r, status } : r)
        )
      } else {
        alert('Ошибка обновления статуса')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка обновления статуса')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      new: { label: '🆕 Новая', variant: 'default' },
      contacted: { label: '✅ Связались', variant: 'secondary' },
      scheduled: { label: '📅 Запланировано', variant: 'outline' },
      declined: { label: '❌ Отклонено', variant: 'destructive' },
    }

    const config = variants[status] || { label: status, variant: 'secondary' }
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  const detectContactType = (contact: string) => {
    if (contact.includes('@') && !contact.includes('+')) {
      return { type: 'email', icon: Mail }
    }
    return { type: 'phone', icon: Phone }
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

  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Пока нет заявок
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Заявки от клиентов будут появляться здесь. Убедитесь, что ваш профиль 
          заполнен и включен прием клиентов.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request, index) => {
        const contactInfo = detectContactType(request.contact)
        const ContactIcon = contactInfo.icon
        const isNew = request.status === 'new'

        return (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              bg-white rounded-lg border-2 p-6
              ${isNew ? 'border-blue-300 shadow-md' : 'border-gray-200 shadow-sm'}
            `}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${isNew ? 'bg-blue-100' : 'bg-gray-100'}
                `}>
                  <User className={`w-6 h-6 ${isNew ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {request.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4" />
                    {formatRelativeTime(request.createdAt)}
                  </div>
                </div>
              </div>
              {getStatusBadge(request.status)}
            </div>

            {/* Контакт */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-3">
              <ContactIcon className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-medium">
                  {contactInfo.type === 'email' ? 'Email' : 'Телефон'}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {request.contact}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(request.contact)
                }}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-600"
                title="Копировать"
              >
                📋
              </button>
            </div>

            {/* Сообщение */}
            {request.message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Сообщение от клиента:
                </p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {request.message}
                </p>
              </div>
            )}

            {/* Действия */}
            {request.status === 'new' && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => handleUpdateStatus(request.id, 'contacted')}
                  disabled={updatingId === request.id}
                  size="sm"
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Связался
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(request.id, 'scheduled')}
                  disabled={updatingId === request.id}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  📅 Запланировать
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(request.id, 'declined')}
                  disabled={updatingId === request.id}
                  size="sm"
                  variant="outline"
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                  Отклонить
                </Button>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

