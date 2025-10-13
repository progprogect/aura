/**
 * Список услуг специалиста в dashboard
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, ShoppingCart, EyeOff, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServiceForm } from './ServiceForm'
import { formatServicePrice } from '@/lib/services/utils'
import type { Service } from '@/types/service'

interface ServicesListProps {
  services: Service[]
  onRefresh?: () => void
  specialistSlug?: string
}

export function ServicesList({ services: initialServices, onRefresh, specialistSlug }: ServicesListProps) {
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
        onRefresh?.()
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
    onRefresh?.()
  }

  const handleToggleActive = async (service: Service) => {
    try {
      const response = await fetch(`/api/specialist/services/${service.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !service.isActive,
        }),
      })

      if (response.ok) {
        setServices(prev => 
          prev.map(s => 
            s.id === service.id 
              ? { ...s, isActive: !s.isActive }
              : s
          )
        )
        onRefresh?.()
      } else {
        alert('Ошибка обновления статуса услуги')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка обновления статуса услуги')
    }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg border-2 border-gray-200 p-4 lg:p-5 xl:p-6 hover:border-blue-300 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xl lg:text-2xl">{service.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm lg:text-base xl:text-lg line-clamp-2">
                      {service.title}
                    </h4>
                    {service.deliveryDays && (
                      <p className="text-xs text-gray-500">
                        ⏱️ {service.deliveryDays} {service.deliveryDays === 1 ? 'день' : 'дней'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {!service.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Неактивна
                    </Badge>
                  )}
                  <button
                    onClick={() => handleToggleActive(service)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={service.isActive ? 'Скрыть услугу' : 'Показать услугу'}
                  >
                    {service.isActive ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs lg:text-sm xl:text-base text-gray-600 mb-3 line-clamp-2">
                {service.description}
              </p>

              {/* Highlights */}
              {service.highlights.length > 0 && (
                <div className="mb-3 space-y-1">
                  {service.highlights.slice(0, 2).map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                      <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                      <span className="line-clamp-1">{highlight}</span>
                    </div>
                  ))}
                  {service.highlights.length > 2 && (
                    <p className="text-xs text-gray-500 pl-4">
                      +{service.highlights.length - 2} ещё
                    </p>
                  )}
                </div>
              )}

              {/* Price & Stats */}
              <div className="mb-4 p-2 lg:p-3 bg-green-50 rounded-lg">
                <p className="text-lg lg:text-xl xl:text-2xl font-bold text-green-700 mb-2">
                  {formatServicePrice(service.price, service.currency)}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {service.viewCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    {service.orderCount}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5">
                {specialistSlug && (
                  <Link
                    href={`/specialist/${specialistSlug}/services/${service.slug}`}
                    target="_blank"
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1 text-xs lg:text-sm xl:text-base px-2 lg:px-3 xl:px-4"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden sm:inline">Посмотреть</span>
                      <span className="sm:hidden">→</span>
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={() => handleEdit(service)}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-xs lg:text-sm xl:text-base px-2 lg:px-3 xl:px-4"
                >
                  <Edit2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Редактировать</span>
                  <span className="sm:hidden">Изменить</span>
                </Button>
                <Button
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                  variant="outline"
                  size="sm"
                  className="gap-1 text-red-600 hover:text-red-700 hover:border-red-300 text-xs lg:text-sm xl:text-base px-2 lg:px-3 xl:px-4"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Удалить</span>
                  <span className="sm:hidden">×</span>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

