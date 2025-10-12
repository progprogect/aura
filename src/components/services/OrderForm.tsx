/**
 * Форма заказа услуги клиентом
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface OrderFormProps {
  serviceId: string
  serviceName: string
  specialistName: string
}

export function OrderForm({ serviceId, serviceName, specialistName }: OrderFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientContact: '',
    clientMessage: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.clientName.trim()) {
      setError('Укажите ваше имя')
      return
    }

    if (!formData.clientContact.trim()) {
      setError('Укажите телефон для связи')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          clientName: formData.clientName,
          clientContact: formData.clientContact,
          clientMessage: formData.clientMessage || null,
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({
          clientName: '',
          clientContact: '',
          clientMessage: '',
        })
      } else {
        setError(data.error || 'Ошибка отправки заказа')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      setError('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Заказ отправлен!
          </h3>
          <p className="text-gray-600 mb-6">
            {specialistName} получит ваш заказ и свяжется с вами в течение 24 часов.
          </p>
          <Button
            onClick={() => setSuccess(false)}
            variant="outline"
            className="w-full"
          >
            Оформить ещё заказ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📋 Оформить заказ
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <Label htmlFor="clientName">Ваше имя *</Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            placeholder="Иван"
            required
            maxLength={100}
          />
        </div>

        {/* Contact */}
        <div>
          <Label htmlFor="clientContact">Телефон *</Label>
          <Input
            id="clientContact"
            value={formData.clientContact}
            onChange={(e) => setFormData(prev => ({ ...prev, clientContact: e.target.value }))}
            placeholder="+375 29 123 45 67"
            required
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            Специалист свяжется с вами по этому номеру
          </p>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="clientMessage">Сообщение (опционально)</Label>
          <textarea
            id="clientMessage"
            value={formData.clientMessage}
            onChange={(e) => setFormData(prev => ({ ...prev, clientMessage: e.target.value }))}
            placeholder="Расскажите о вашем запросе, удобном времени для связи..."
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.clientMessage.length}/500
          </p>
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-1">ℹ️ Что дальше?</p>
          <p className="text-xs">
            После оформления заказа специалист свяжется с вами для уточнения деталей и подтверждения.
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Отправка...' : 'Оставить заказ'}
        </Button>
      </form>
    </div>
  )
}

