/**
 * Форма добавления/редактирования услуги
 */

'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatServicePrice } from '@/lib/services/utils'
import type { Service } from '@/types/service'

interface ServiceFormProps {
  service?: Service | null
  onClose: () => void
  onSuccess: () => void
}

export function ServiceForm({ service, onClose, onSuccess }: ServiceFormProps) {
  const isEditing = !!service

  const [formData, setFormData] = useState({
    title: service?.title || '',
    description: service?.description || '',
    highlights: service?.highlights || [''],
    price: service?.price || 0,
    deliveryDays: service?.deliveryDays || null as number | null,
    emoji: service?.emoji || '💼',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleAddHighlight = () => {
    if (formData.highlights.length < 5) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, '']
      }))
    }
  }

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }))
  }

  const handleHighlightChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Валидация
    if (formData.title.length < 5) {
      setError('Название должно быть не менее 5 символов')
      return
    }

    if (formData.description.length < 20) {
      setError('Описание должно быть не менее 20 символов')
      return
    }

    const cleanHighlights = formData.highlights.filter(h => h.trim().length > 0)
    if (cleanHighlights.length === 0) {
      setError('Добавьте хотя бы один пункт "Что входит"')
      return
    }

    if (formData.price < 1) {
      setError('Укажите цену')
      return
    }

    setIsSubmitting(true)

    try {
      const url = isEditing 
        ? `/api/specialist/services/${service.id}`
        : '/api/specialist/services'
      
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          highlights: cleanHighlights,
          deliveryDays: formData.deliveryDays || null,
        })
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || 'Ошибка сохранения')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setError('Ошибка сохранения услуги')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Редактировать услугу' : 'Новая услуга'}
          </h3>
          <p className="text-sm text-gray-600">
            Опишите что входит в услугу и укажите стоимость
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Emoji & Title */}
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <div>
            <Label htmlFor="emoji">Эмодзи</Label>
            <Input
              id="emoji"
              value={formData.emoji}
              onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
              maxLength={2}
              className="text-2xl text-center"
            />
          </div>
          <div>
            <Label htmlFor="title">Название услуги *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Индивидуальная консультация"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Описание *</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Подробно опишите вашу услугу, какие задачи она решает, для кого подходит..."
            className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={1000}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/1000
          </p>
        </div>

        {/* Highlights - Что входит */}
        <div>
          <Label>Что входит в услугу *</Label>
          <p className="text-sm text-gray-600 mb-3">
            Перечислите основные пункты (максимум 5)
          </p>
          
          <div className="space-y-2">
            {formData.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <Input
                  value={highlight}
                  onChange={(e) => handleHighlightChange(index, e.target.value)}
                  placeholder="Например: 60 минут консультации"
                  maxLength={100}
                />
                {formData.highlights.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveHighlight(index)}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {formData.highlights.length < 5 && (
            <Button
              type="button"
              onClick={handleAddHighlight}
              variant="outline"
              size="sm"
              className="mt-3 gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить пункт
            </Button>
          )}
        </div>

        {/* Price & Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Стоимость (в баллах) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              placeholder="100"
              min={1}
              max={999999}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.price > 0 && `≈ ${formatServicePrice(formData.price, 'BYN')}`}
            </p>
          </div>
          <div>
            <Label htmlFor="deliveryDays">Срок выполнения (дней)</Label>
            <Input
              id="deliveryDays"
              type="number"
              value={formData.deliveryDays || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                deliveryDays: e.target.value ? parseInt(e.target.value) : null 
              }))}
              placeholder="7"
              min={1}
              max={90}
            />
            <p className="text-xs text-gray-500 mt-1">
              Опционально
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">Превью карточки:</p>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{formData.emoji}</span>
              <h4 className="font-semibold text-gray-900">{formData.title || 'Название услуги'}</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {formData.description || 'Описание услуги...'}
            </p>
            <div className="p-2 bg-green-50 rounded">
              <p className="text-lg font-bold text-green-700">
                {formData.price > 0 ? formatServicePrice(formData.price, 'BYN') : '0 BYN'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать услугу'}
          </Button>
        </div>
      </form>
    </div>
  )
}

