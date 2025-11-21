/**
 * Редактор контактов специалиста
 * Email, Telegram, WhatsApp, Website
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InlineInput } from './InlineInput'
import { Mail, MessageCircle, Phone, Globe, Loader2 } from 'lucide-react'

interface ContactsEditorProps {
  email: string | null
  phone: string | null // Телефон из User.phone
  phoneVisible?: boolean // Видимость телефона для клиентов
  telegram: string | null
  whatsapp: string | null
  website: string | null
  onSave: (field: string, value: string | number | boolean) => Promise<any>
}

export function ContactsEditor({
  email,
  phone,
  phoneVisible = true,
  telegram,
  whatsapp,
  website,
  onSave
}: ContactsEditorProps) {
  const [isUpdatingPhoneVisible, setIsUpdatingPhoneVisible] = useState(false)
  const [localPhoneVisible, setLocalPhoneVisible] = useState(phoneVisible)

  // Синхронизируем локальное состояние с пропом при изменении
  useEffect(() => {
    setLocalPhoneVisible(phoneVisible)
  }, [phoneVisible])

  const handleTogglePhoneVisible = async () => {
    const newValue = !localPhoneVisible
    setIsUpdatingPhoneVisible(true)
    // Оптимистичное обновление UI
    setLocalPhoneVisible(newValue)
    try {
      await onSave('phoneVisible', newValue)
    } catch (error) {
      console.error('Ошибка обновления видимости телефона:', error)
      // Откатываем изменение при ошибке
      setLocalPhoneVisible(!newValue)
      alert('Ошибка обновления видимости телефона')
    } finally {
      setIsUpdatingPhoneVisible(false)
    }
  }

  return (
    <Card className="border-blue-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          📞 Контакты
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Телефон */}
        {phone && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Телефон</label>
                {/* Переключатель видимости */}
                <button
                  type="button"
                  onClick={handleTogglePhoneVisible}
                  disabled={isUpdatingPhoneVisible}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ml-4
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
                    ${localPhoneVisible 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300'
                    }
                    ${isUpdatingPhoneVisible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  role="switch"
                  aria-checked={localPhoneVisible}
                  aria-label="Показать телефон клиентам"
                >
                  {isUpdatingPhoneVisible ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={12} className="animate-spin text-white" />
                    </span>
                  ) : (
                    <span
                      className={`
                        absolute top-0.5 left-0.5
                        block w-5 h-5 bg-white rounded-full shadow-sm
                        transform transition-transform duration-200
                        ${localPhoneVisible ? 'translate-x-6' : 'translate-x-0'}
                      `}
                    />
                  )}
                </button>
              </div>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {phone}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">Номер телефона из регистрации</p>
                <p className={`text-xs ${localPhoneVisible ? 'text-green-600' : 'text-gray-400'}`}>
                  {localPhoneVisible ? 'Виден клиентам' : 'Скрыт от клиентов'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Email */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <InlineInput
              value={email || ''}
              field="email"
              onSave={onSave}
              isEditMode={true}
              type="email"
              placeholder="example@email.com"
              label="Email"
            />
          </div>
        </div>

        {/* Telegram */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <InlineInput
              value={telegram || ''}
              field="telegram"
              onSave={onSave}
              isEditMode={true}
              placeholder="@username"
              label="Telegram"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <InlineInput
              value={whatsapp || ''}
              field="whatsapp"
              onSave={onSave}
              isEditMode={true}
              placeholder="+7 (999) 123-45-67"
              label="WhatsApp"
            />
          </div>
        </div>

        {/* Website */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <InlineInput
              value={website || ''}
              field="website"
              onSave={onSave}
              isEditMode={true}
              type="url"
              placeholder="https://example.com"
              label="Веб-сайт"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 pt-4 border-t">
          💡 Клиенты смогут связаться с вами через указанные контакты
        </p>
      </CardContent>
    </Card>
  )
}

