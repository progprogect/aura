/**
 * Модальное окно для добавления/редактирования сертификата
 */

'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Certificate {
  id?: string
  title: string
  organization: string
  year: number
  fileUrl?: string | null
}

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
  certificate?: Certificate
  onSave: () => void
}

export function CertificateModal({ isOpen, onClose, certificate, onSave }: CertificateModalProps) {
  const isEdit = !!certificate

  const [formData, setFormData] = useState<Certificate>({
    title: certificate?.title || '',
    organization: certificate?.organization || '',
    year: certificate?.year || new Date().getFullYear(),
    fileUrl: certificate?.fileUrl || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: keyof Certificate, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async () => {
    // Валидация
    if (!formData.title.trim()) {
      setError('Укажите название сертификата')
      return
    }
    if (!formData.organization.trim()) {
      setError('Укажите организацию')
      return
    }
    if (formData.year < 1950 || formData.year > new Date().getFullYear() + 10) {
      setError('Некорректный год')
      return
    }

    setLoading(true)
    setError('')

    try {
      const url = isEdit 
        ? `/api/specialist/certificates/${certificate?.id}`
        : '/api/specialist/certificates'

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fileUrl: formData.fileUrl || null
        })
      })

      const result = await response.json()

      if (result.success) {
        onSave()
        onClose()
      } else {
        setError(result.error || 'Ошибка сохранения')
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Редактировать сертификат' : 'Добавить сертификат'}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Название сертификата */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Название сертификата <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="Нутрициолог-диетолог"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="h-11"
          />
        </div>

        {/* Организация */}
        <div className="space-y-2">
          <Label htmlFor="organization">
            Организация <span className="text-red-500">*</span>
          </Label>
          <Input
            id="organization"
            type="text"
            placeholder="Институт нутрициологии"
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
            className="h-11"
          />
        </div>

        {/* Год получения */}
        <div className="space-y-2">
          <Label htmlFor="year">
            Год получения <span className="text-red-500">*</span>
          </Label>
          <Input
            id="year"
            type="number"
            min={1950}
            max={currentYear + 10}
            value={formData.year}
            onChange={(e) => handleChange('year', parseInt(e.target.value, 10))}
            className="h-11"
          />
        </div>

        {/* URL файла (опционально) */}
        <div className="space-y-2">
          <Label htmlFor="fileUrl">
            Ссылка на файл <span className="text-gray-500 text-xs">(опционально)</span>
          </Label>
          <Input
            id="fileUrl"
            type="url"
            placeholder="https://example.com/certificate.pdf"
            value={formData.fileUrl || ''}
            onChange={(e) => handleChange('fileUrl', e.target.value)}
            className="h-11"
          />
          <p className="text-xs text-gray-500">
            URL на скан сертификата (PDF, JPG, PNG)
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </Dialog>
  )
}

