/**
 * Модальное окно с контактами специалиста
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, MessageCircle, MessageSquare, Globe, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContactsModalProps {
  isOpen: boolean
  onClose: () => void
  onContactClick: () => void
  specialistName: string
  email?: string | null
  phone?: string | null // Телефон из User.phone
  phoneVisible?: boolean // Видимость телефона для клиентов
  telegram?: string | null
  whatsapp?: string | null
  website?: string | null
}

export function ContactsModal({
  isOpen,
  onClose,
  onContactClick,
  specialistName,
  email,
  phone,
  phoneVisible = true,
  telegram,
  whatsapp,
  website,
}: ContactsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Ошибка копирования:', err)
    }
  }

  const getTelegramUrl = (telegram: string) => {
    const username = telegram.startsWith('@') ? telegram.slice(1) : telegram
    return `https://t.me/${username}`
  }

  const getWhatsappUrl = (whatsapp: string) => {
    const cleaned = whatsapp.replace(/\D/g, '')
    return `https://wa.me/${cleaned}`
  }

  const formatTelegram = (telegram: string) => {
    return telegram.startsWith('@') ? telegram : `@${telegram}`
  }

  const formatPhone = (phone: string) => {
    // Простое форматирование телефона
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`
    }
    return phone
  }

  // Проверяем, есть ли хотя бы один контакт (телефон учитываем только если он виден)
  const hasAnyContact = !!(email || (phone && phoneVisible) || telegram || whatsapp || website)

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
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="
            relative z-10 w-full max-w-lg
            bg-white rounded-t-2xl sm:rounded-2xl
            shadow-2xl
            max-h-[90vh] overflow-y-auto
          "
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-semibold text-gray-900">
              Контакты
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {hasAnyContact ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Выберите удобный способ связи с {specialistName.split(' ')[0]}:
                </p>

                {/* Email */}
                {email && (
                  <ContactItem
                    icon={Mail}
                    label="Email"
                    value={email}
                    href={`mailto:${email}`}
                    onCopy={() => handleCopy(email, 'email')}
                    isCopied={copiedField === 'email'}
                  />
                )}

                {/* Телефон */}
                {phone && phoneVisible && (
                  <ContactItem
                    icon={Phone}
                    label="Телефон"
                    value={formatPhone(phone)}
                    href={`tel:${phone}`}
                    onCopy={() => handleCopy(phone, 'phone')}
                    isCopied={copiedField === 'phone'}
                  />
                )}

                {/* Telegram */}
                {telegram && (
                  <ContactItem
                    icon={MessageCircle}
                    label="Telegram"
                    value={formatTelegram(telegram)}
                    href={getTelegramUrl(telegram)}
                    onCopy={() => handleCopy(formatTelegram(telegram), 'telegram')}
                    isCopied={copiedField === 'telegram'}
                  />
                )}

                {/* WhatsApp */}
                {whatsapp && (
                  <ContactItem
                    icon={MessageSquare}
                    label="WhatsApp"
                    value={whatsapp}
                    href={getWhatsappUrl(whatsapp)}
                    onCopy={() => handleCopy(whatsapp, 'whatsapp')}
                    isCopied={copiedField === 'whatsapp'}
                  />
                )}

                {/* Website */}
                {website && (
                  <ContactItem
                    icon={Globe}
                    label="Сайт"
                    value={website}
                    href={website}
                    onCopy={() => handleCopy(website, 'website')}
                    isCopied={copiedField === 'website'}
                  />
                )}
              </div>
            ) : (
              // Пустой экран с информацией
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Контакты пока не добавлены
                </h3>
                <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
                  Специалист ещё не указал способы связи. Вы можете оставить заявку, 
                  и {specialistName.split(' ')[0]} свяжется с вами.
                </p>
                <Button
                  onClick={() => {
                    onClose()
                    onContactClick()
                  }}
                  size="lg"
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Связаться
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Компонент для отдельного контакта
function ContactItem({
  icon: Icon,
  label,
  value,
  href,
  onCopy,
  isCopied,
}: {
  icon: any
  label: string
  value: string
  href: string
  onCopy: () => void
  isCopied: boolean
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase">
              {label}
            </p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {value}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            title="Копировать"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-blue-100 rounded-md transition-colors text-blue-600"
            title="Открыть"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

