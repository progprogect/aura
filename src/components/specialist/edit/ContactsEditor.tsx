/**
 * Редактор контактов специалиста
 * Email, Telegram, WhatsApp, Instagram, Website
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InlineInput } from './InlineInput'
import { Mail, MessageCircle, Phone, Instagram as InstagramIcon, Globe } from 'lucide-react'

interface ContactsEditorProps {
  email: string | null
  telegram: string | null
  whatsapp: string | null
  instagram: string | null
  website: string | null
  onSave: (field: string, value: string | number) => Promise<any>
}

export function ContactsEditor({
  email,
  telegram,
  whatsapp,
  instagram,
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

        {/* Instagram */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-pink-50 rounded-lg flex-shrink-0">
            <InstagramIcon className="w-5 h-5 text-pink-600" />
          </div>
          <div className="flex-1">
            <InlineInput
              value={instagram || ''}
              field="instagram"
              onSave={onSave}
              isEditMode={true}
              placeholder="@username"
              label="Instagram"
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

