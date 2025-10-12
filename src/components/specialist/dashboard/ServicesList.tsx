/**
 * Список услуг специалиста в dashboard
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServiceForm } from './ServiceForm'
import { formatServicePrice } from '@/lib/services/utils'
import type { Service } from '@/types/service'

interface ServicesListProps {
  services: Service[]
  onRefresh: () => void
}

export function ServicesList({ services: initialServices, onRefresh }: ServicesListProps) {
  const [services, setServices] = useState(initialServices)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту услугу? Она больше не будет отображаться в профиле.')) {
      return
    }

    setDeletingId(id)
    
    try {
      const response = await fetch(`/api/specialist/services/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setServices(prev => prev.filter(s => s.id !== id))
        onRefresh()
      } else {
        alert('Ошибка удаления услуги')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка удаления услуги')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingService(null)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingService(null)
    onRefresh()
  }

  if (isFormOpen) {
    return (
      <ServiceForm
        service={editingService}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Мои услуги</h3>
          <p className="text-sm text-gray-600">
            {services.length} из 10 услуг
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          disabled={services.length >= 10}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить услугу
        </Button>
      </div>

      {/* Empty state */}
      {services.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Добавьте свои услуги
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Предложите клиентам свои основные продукты: консультации, программы, диагностику и другое.
          </p>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Создать первую услугу
          </Button>
        </div>
      )}

      {/* Services grid */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-300 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{service.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {service.title}
                    </h4>
                    {service.deliveryDays && (
                      <p className="text-xs text-gray-500">
                        ⏱️ {service.deliveryDays} {service.deliveryDays === 1 ? 'день' : 'дней'}
                      </p>
                    )}
                  </div>
                </div>
                {!service.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Неактивна
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {service.description}
              </p>

              {/* Highlights */}
              {service.highlights.length > 0 && (
                <div className="mb-4 space-y-1">
                  {service.highlights.slice(0, 2).map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span className="line-clamp-1">{highlight}</span>
                    </div>
                  ))}
                  {service.highlights.length > 2 && (
                    <p className="text-xs text-gray-500 pl-5">
                      +{service.highlights.length - 2} ещё
                    </p>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {formatServicePrice(service.price, service.currency)}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {service.viewCount}
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingCart className="w-4 h-4" />
                  {service.orderCount} заказов
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(service)}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <Edit2 className="w-3 h-3" />
                  Редактировать
                </Button>
                <Button
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                  Удалить
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

