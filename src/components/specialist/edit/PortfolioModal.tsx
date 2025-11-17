/**
 * Модальное окно для добавления/редактирования элемента портфолио
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, Image as ImageIcon, Video, X, Loader2 } from 'lucide-react'

interface PortfolioItem {
  id?: string
  type?: 'photo' | 'video'
  url?: string
  thumbnailUrl?: string | null
  title: string
  description?: string | null
}

interface PortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  portfolioItem?: PortfolioItem
  onSave: () => void
}

export function PortfolioModal({ isOpen, onClose, portfolioItem, onSave }: PortfolioModalProps) {
  const isEdit = !!portfolioItem

  const [formData, setFormData] = useState<PortfolioItem>({
    title: portfolioItem?.title || '',
    description: portfolioItem?.description || '',
  })

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(portfolioItem?.url || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Сброс формы при открытии/закрытии модального окна или изменении portfolioItem
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: portfolioItem?.title || '',
        description: portfolioItem?.description || '',
      })
      setFile(null)
      setPreview(portfolioItem?.url || null)
      setError('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [isOpen, portfolioItem])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    // Проверка типа
    const isImage = selectedFile.type.startsWith('image/')
    const isVideo = selectedFile.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      setError('Можно загружать только фото или видео')
      return
    }

    // Проверка размера
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError(`Файл слишком большой. Максимум ${isVideo ? 100 : 10}MB`)
      return
    }

    setFile(selectedFile)
    setError('')

    // Создаем превью
    if (isImage) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null) // Для видео превью будет с сервера
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(isEdit ? portfolioItem?.url || null : null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleChange = (field: keyof PortfolioItem, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async () => {
    // Валидация
    if (!formData.title.trim()) {
      setError('Укажите заголовок работы')
      return
    }

    if (formData.title.trim().length < 2) {
      setError('Заголовок должен содержать минимум 2 символа')
      return
    }

    // При создании файл обязателен
    if (!isEdit && !file) {
      setError('Выберите файл для загрузки')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      
      // Если есть новый файл, добавляем его
      if (file) {
        formDataToSend.append('file', file)
      }
      
      formDataToSend.append('title', formData.title.trim())
      if (formData.description) {
        formDataToSend.append('description', formData.description.trim())
      }

      const url = isEdit 
        ? `/api/specialist/portfolio/${portfolioItem?.id}`
        : '/api/specialist/portfolio'

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (result.success) {
        onSave()
        onClose()
        // Сброс формы
        setFormData({ title: '', description: '' })
        setFile(null)
        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setError(result.error || 'Ошибка сохранения')
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Редактировать работу' : 'Добавить работу в портфолио'}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Загрузка файла */}
        <div className="space-y-2">
          <Label>
            {isEdit ? 'Файл (оставьте пустым, чтобы не менять)' : 'Файл'} <span className="text-red-500">*</span>
          </Label>
          
          {preview ? (
            <div className="relative">
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                {preview.startsWith('data:image') || preview.startsWith('http') ? (
                  <img
                    src={preview}
                    alt="Превью"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <Video className="w-12 h-12 text-white opacity-50" />
                  </div>
                )}
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
              {!isEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  {file?.type.startsWith('image/') ? '📸 Фото' : '🎥 Видео'}
                </p>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="
                border-2 border-dashed border-gray-300 rounded-lg p-8
                cursor-pointer hover:border-blue-400 hover:bg-blue-50
                transition-colors text-center
              "
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-1">
                Нажмите для загрузки фото или видео
              </p>
              <p className="text-xs text-gray-500">
                Фото: до 10MB, Видео: до 100MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />
        </div>

        {/* Заголовок */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Заголовок работы <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="Название проекта или работы"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="h-11"
            disabled={loading}
          />
        </div>

        {/* Описание */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Описание <span className="text-gray-500 text-xs">(опционально)</span>
          </Label>
          <textarea
            id="description"
            placeholder="Расскажите о работе, результатах, процессе..."
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="
              flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
              ring-offset-background placeholder:text-muted-foreground 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
              disabled:cursor-not-allowed disabled:opacity-50
            "
            disabled={loading}
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

