'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { LeadMagnet } from '@/types/lead-magnet'

interface ServicePreviewProps {
  leadMagnet: Pick<LeadMagnet, 'id' | 'title' | 'description' | 'emoji' | 'highlights'>
  specialistId?: string
  specialistName?: string
  className?: string
}

export function ServicePreview({ leadMagnet, specialistId, specialistName, className }: ServicePreviewProps) {
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
          leadMagnetId: leadMagnet.id,
          name: name.trim(),
          contact: contact.trim(),
          message: message.trim() || `Заявка на: ${leadMagnet.title}`,
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

  if (isSuccess) {
    return (
      <div className={cn(
        "w-full bg-white rounded-lg border border-gray-200 p-6",
        className
      )}>
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
      </div>
    )
  }

  return (
    <div className={cn(
      "w-full bg-white rounded-lg border border-gray-200 p-6",
      className
    )}>
      {/* Заголовок с иконкой */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl text-white">{leadMagnet.emoji || '💼'}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {leadMagnet.title}
        </h3>
        {leadMagnet.description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {leadMagnet.description}
          </p>
        )}
      </div>

      {/* Highlights если есть */}
      {leadMagnet.highlights && leadMagnet.highlights.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Что включает:
          </h4>
          <ul className="space-y-2">
            {leadMagnet.highlights.map((highlight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-2 text-sm text-gray-700"
              >
                <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <span>{highlight}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Форма заявки */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Имя */}
        <div>
          <label
            htmlFor="service-name"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
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

        {/* Контакт */}
        <div>
          <label
            htmlFor="service-contact"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
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

        {/* Сообщение */}
        <div>
          <label
            htmlFor="service-message"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
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

        {/* Кнопка отправки */}
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
    </div>
  )
}
