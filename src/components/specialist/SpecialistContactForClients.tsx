/**
 * Компонент контактов для связи с клиентами
 * Отдельно от email для регистрации
 */

'use client'

import { useState } from 'react'
import { InlineInput } from './edit/InlineInput'
import { EditableSection } from './edit/EditableSection'
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  MessageSquare,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'

interface SpecialistContactForClientsProps {
  email?: string | null
  phone?: string | null
  telegram?: string | null
  whatsapp?: string | null
  isEditMode?: boolean
  onSave?: (field: string, value: string | number) => Promise<any>
}

export function SpecialistContactForClients({
  email,
  phone,
  telegram,
  whatsapp,
  isEditMode = false,
  onSave
}: SpecialistContactForClientsProps) {
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

  const formatPhone = (phone: string) => {
    // Простое форматирование телефона
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`
    }
    return phone
  }

  const getTelegramUrl = (telegram: string) => {
    const username = telegram.startsWith('@') ? telegram.slice(1) : telegram
    return `https://t.me/${username}`
  }

  const getWhatsappUrl = (whatsapp: string) => {
    const cleaned = whatsapp.replace(/\D/g, '')
    return `https://wa.me/${cleaned}`
  }

  const ContactItem = ({ 
    icon: Icon, 
    label, 
    value, 
    href, 
    field, 
    type = 'text' 
  }: {
    icon: any
    label: string
    value: string | null
    href?: string
    field: string
    type?: 'email' | 'phone' | 'text'
  }) => {
    if (isEditMode) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <InlineInput
            value={value || ''}
            field={field}
            isEditMode={true}
            placeholder={`Введите ${label.toLowerCase()}`}
            onSave={async (fieldName, newValue) => {
              if (onSave) {
                await onSave(fieldName, newValue)
              }
            }}
          />
        </div>
      )
    }

    if (!value) {
      return (
        <div className="flex items-center gap-3 text-gray-400">
          <Icon className="w-5 h-5" />
          <span className="text-sm">{label} не указан</span>
        </div>
      )
    }

    const displayValue = type === 'phone' ? formatPhone(value) : value

    return (
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-700">{label}</div>
            <div className="text-sm text-gray-600 truncate">{displayValue}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Открыть"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => handleCopy(value, field)}
            className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Скопировать"
          >
            {copiedField === field ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Email */}
      <ContactItem
        icon={Mail}
        label="Email"
        value={email || null}
        field="contactEmail"
        type="email"
        href={email ? `mailto:${email}` : undefined}
      />

      {/* Телефон */}
      <ContactItem
        icon={Phone}
        label="Телефон"
        value={phone || null}
        field="contactPhone"
        type="phone"
        href={phone ? `tel:${phone}` : undefined}
      />

      {/* Telegram */}
      <ContactItem
        icon={MessageCircle}
        label="Telegram"
        value={telegram || null}
        field="contactTelegram"
        href={telegram ? getTelegramUrl(telegram) : undefined}
      />

      {/* WhatsApp */}
      <ContactItem
        icon={MessageSquare}
        label="WhatsApp"
        value={whatsapp || null}
        field="contactWhatsapp"
        type="phone"
        href={whatsapp ? getWhatsappUrl(whatsapp) : undefined}
      />

      {/* Подсказка */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">
            💡
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Как это работает:</p>
            <p>Укажите контакты, по которым клиенты смогут с вами связаться. Эти данные будут отображаться в разделе &quot;Связаться&quot; на вашем профиле.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
