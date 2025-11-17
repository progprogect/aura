/**
 * Редактор контактов специалиста
 * Email, Telegram, WhatsApp, Website
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InlineInput } from './InlineInput'
import { Mail, MessageCircle, Phone, Globe } from 'lucide-react'

interface ContactsEditorProps {
  email: string | null
  phone: string | null // Телефон из User.phone
  telegram: string | null
  whatsapp: string | null
  website: string | null
  onSave: (field: string, value: string | number) => Promise<any>
}

export function ContactsEditor({
  email,
  phone,
  telegram,
  whatsapp,
  website,
  onSave
}: ContactsEditorProps) {
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
              <label className="text-sm font-medium text-gray-700 mb-1 block">Телефон</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                {phone}
              </div>
              <p className="text-xs text-gray-500 mt-1">Номер телефона из регистрации</p>
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

