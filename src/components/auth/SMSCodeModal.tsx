'use client'

import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface SMSCodeModalProps {
  isOpen: boolean
  onClose: () => void
  code: string
  phone: string
  purpose: 'login' | 'registration'
}

export function SMSCodeModal({ isOpen, onClose, code, phone, purpose }: SMSCodeModalProps) {
  const purposeText = purpose === 'login' ? 'входа' : 'регистрации'

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Код подтверждения"
      footer={
        <Button onClick={onClose} className="w-full" size="lg">
          Понятно
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-muted-foreground">
            Код отправлен на номер
          </p>
          <p className="text-lg font-semibold text-gray-900">{phone}</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
          <p className="text-sm text-blue-600 mb-2">Ваш код для {purposeText}:</p>
          <div className="text-4xl font-bold text-blue-900 tracking-wider font-mono">
            {code}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Введите этот код в поле ниже для подтверждения
        </p>
      </div>
    </Dialog>
  )
}

