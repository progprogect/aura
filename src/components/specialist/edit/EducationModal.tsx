/**
 * Модальное окно для добавления/редактирования образования
 */

'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Education {
  id?: string
  institution: string
  degree: string
  year: number
  description?: string | null
}

interface EducationModalProps {
  isOpen: boolean
  onClose: () => void
  education?: Education
  onSave: () => void
}

export function EducationModal({ isOpen, onClose, education, onSave }: EducationModalProps) {
  const isEdit = !!education

  const [formData, setFormData] = useState<Education>({
    institution: education?.institution || '',
    degree: education?.degree || '',
    year: education?.year || new Date().getFullYear(),
    description: education?.description || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field: keyof Education, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async () => {
    // Валидация
    if (!formData.institution.trim()) {
      setError('Укажите учебное заведение')
      return
    }
    if (!formData.degree.trim()) {
      setError('Укажите специальность')
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
        ? `/api/specialist/education/${education?.id}`
        : '/api/specialist/education'

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      title={isEdit ? 'Редактировать образование' : 'Добавить образование'}
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
        {/* Учебное заведение */}
        <div className="space-y-2">
          <Label htmlFor="institution">
            Учебное заведение <span className="text-red-500">*</span>
          </Label>
          <Input
            id="institution"
            type="text"
            placeholder="МГУ им. М.В. Ломоносова"
            value={formData.institution}
            onChange={(e) => handleChange('institution', e.target.value)}
            className="h-11"
          />
        </div>

        {/* Специальность */}
        <div className="space-y-2">
          <Label htmlFor="degree">
            Специальность/Степень <span className="text-red-500">*</span>
          </Label>
          <Input
            id="degree"
            type="text"
            placeholder="Клиническая психология"
            value={formData.degree}
            onChange={(e) => handleChange('degree', e.target.value)}
            className="h-11"
          />
        </div>

        {/* Год окончания */}
        <div className="space-y-2">
          <Label htmlFor="year">
            Год окончания <span className="text-red-500">*</span>
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

        {/* Описание (опционально) */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Описание <span className="text-gray-500 text-xs">(опционально)</span>
          </Label>
          <textarea
            id="description"
            placeholder="Дополнительная информация об образовании..."
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="
              flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
              ring-offset-background placeholder:text-muted-foreground 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
              disabled:cursor-not-allowed disabled:opacity-50
            "
          />
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

