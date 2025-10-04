'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SpecialistContactProps {
  specialistId: string
  specialistName: string
  onSubmit?: (data: { name: string; contact: string; message: string }) => Promise<void>
}

export function SpecialistContact({
  specialistId,
  specialistName,
  onSubmit,
}: SpecialistContactProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    contact: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.contact) {
      return
    }

    setIsSubmitting(true)

    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Отправка через API
        const response = await fetch('/api/consultation-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            specialistId,
            ...formData,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to submit')
        }
      }

      setIsSuccess(true)
      setFormData({ name: '', contact: '', message: '' })

      // Сброс состояния успеха через 5 секунд
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <motion.div
      id="contact"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            ✉️ Записаться на консультацию
          </CardTitle>
          <p className="text-sm text-gray-600">
            Оставьте заявку, и {specialistName.split(' ')[0]} свяжется с вами
          </p>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg bg-green-50 p-6 text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900">
                Заявка отправлена!
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Специалист свяжется с вами в ближайшее время
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Имя */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Ваше имя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  htmlFor="contact"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Телефон или email *
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  className={cn(
                    'w-full rounded-lg border border-gray-300 px-4 py-2.5',
                    'text-gray-900 placeholder-gray-400',
                    'transition-colors',
                    'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'
                  )}
                  placeholder="+7 (999) 123-45-67 или email@example.com"
                />
              </div>

              {/* Сообщение */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Сообщение (необязательно)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
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
                  <>
                    <Send className="h-4 w-4" />
                    Отправить заявку
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-gray-500">
                Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}



