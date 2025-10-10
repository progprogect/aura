/**
 * Компонент формы заявки на услугу
 * Вынесен из SmartPreview для переиспользования
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ServiceFormProps {
  leadMagnetId: string
  leadMagnetTitle: string
  specialistId?: string
  specialistName?: string
  className?: string
}

export function ServiceForm({ 
  leadMagnetId, 
  leadMagnetTitle,
  specialistId, 
  specialistName,
  className 
}: ServiceFormProps) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !contact.trim()) {
      alert('Заполните имя и контакт')
      return
    }

    if (!specialistId) {
      alert('Ошибка: не указан специалист')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/consultation-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistId,
          leadMagnetId,
          name: name.trim(),
          contact: contact.trim(),
          message: message.trim() || `Заявка на: ${leadMagnetTitle}`,
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          setIsSuccess(false)
          setName('')
          setContact('')
          setMessage('')
        }, 3000)
      } else {
        alert('Ошибка отправки заявки')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка отправки заявки')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("w-full bg-white rounded-lg border border-gray-200 p-6", className)}>
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-100 border border-green-300 rounded-lg p-4 text-center"
        >
          <div className="text-3xl mb-2">✅</div>
          <p className="text-green-800 font-medium">Заявка отправлена!</p>
          <p className="text-sm text-green-700 mt-1">
            {specialistName} свяжется с вами в ближайшее время
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="service-name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Ваше имя *
            </label>
            <input
              type="text"
              id="service-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={cn(
                'w-full rounded-lg border border-gray-300 px-4 py-2.5',
                'text-gray-900 placeholder-gray-400',
                'transition-colors',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'
              )}
              placeholder="Как к вам обращаться?"
            />
          </div>

          <div>
            <label htmlFor="service-contact" className="mb-1.5 block text-sm font-medium text-gray-700">
              Телефон или Telegram *
            </label>
            <input
              type="text"
              id="service-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className={cn(
                'w-full rounded-lg border border-gray-300 px-4 py-2.5',
                'text-gray-900 placeholder-gray-400',
                'transition-colors',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'
              )}
              placeholder="+7 (999) 123-45-67 или @username"
            />
          </div>

          <div>
            <label htmlFor="service-message" className="mb-1.5 block text-sm font-medium text-gray-700">
              Сообщение (необязательно)
            </label>
            <textarea
              id="service-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className={cn(
                'w-full rounded-lg border border-gray-300 px-4 py-2.5',
                'text-gray-900 placeholder-gray-400',
                'transition-colors',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'resize-none'
              )}
              placeholder="Расскажите кратко о вашем запросе..."
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              'Отправить заявку'
            )}
          </Button>
        </form>
      )}
    </div>
  )
}

