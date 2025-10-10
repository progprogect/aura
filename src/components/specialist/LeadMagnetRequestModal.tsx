/**
 * Модальное окно заявки на услугу из лид-магнита
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { LeadMagnetUI } from '@/types/lead-magnet'

interface LeadMagnetRequestModalProps {
  isOpen: boolean
  onClose: () => void
  specialistId: string
  specialistName: string
  leadMagnet: Pick<LeadMagnetUI, 'id' | 'title' | 'description' | 'emoji'>
}

export function LeadMagnetRequestModal({
  isOpen,
  onClose,
  specialistId,
  specialistName,
  leadMagnet,
}: LeadMagnetRequestModalProps) {
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
          onClose()
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

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative z-10 w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{leadMagnet.emoji}</span>
                <h2 className="text-lg font-semibold text-gray-900">
                  {leadMagnet.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {leadMagnet.description}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Заявка отправлена!
                </h3>
                <p className="text-sm text-gray-600">
                  {specialistName.split(' ')[0]} свяжется с вами в ближайшее время
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ваше имя
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Иван"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Контакт (телефон или email)
                  </label>
                  <Input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+7 999 123-45-67"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Сообщение (опционально)
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Дополнительная информация..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Отправить заявку
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

