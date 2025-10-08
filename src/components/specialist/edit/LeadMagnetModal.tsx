/**
 * Модальное окно добавления лид-магнита
 */

'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface LeadMagnetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function LeadMagnetModal({ isOpen, onClose, onSuccess }: LeadMagnetModalProps) {
  const [type, setType] = useState<'file' | 'link' | 'service'>('file')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [emoji, setEmoji] = useState('🎁')
  const [file, setFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Заполните название и описание')
      return
    }

    if (type === 'link' && !linkUrl.trim()) {
      alert('Укажите ссылку')
      return
    }

    if (type === 'file' && !file) {
      alert('Загрузите файл')
      return
    }

    setIsSaving(true)

    try {
      // Для файла используем FormData
      if (type === 'file' && file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        formData.append('title', title.trim())
        formData.append('description', description.trim())
        formData.append('emoji', emoji)

        const response = await fetch('/api/specialist/lead-magnets', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          onSuccess()
          resetForm()
        } else {
          const error = await response.json()
          alert(error.error || 'Ошибка создания')
        }
        return
      }

      // Для ссылки и услуги используем JSON
      const response = await fetch('/api/specialist/lead-magnets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          linkUrl: type === 'link' ? linkUrl.trim() : null,
          emoji,
        }),
      })

      if (response.ok) {
        onSuccess()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка создания')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка создания лид-магнита')
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setType('file')
    setTitle('')
    setDescription('')
    setLinkUrl('')
    setEmoji('🎁')
    setFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой (макс 10MB)')
      return
    }

    setFile(selectedFile)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-semibold text-gray-900">
              Добавить лид-магнит
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Выбор типа */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900">Тип лид-магнита</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setType('file')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    type === 'file'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📄</div>
                  <div className="text-sm font-medium">Файл</div>
                </button>
                <button
                  onClick={() => setType('link')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    type === 'link'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🔗</div>
                  <div className="text-sm font-medium">Ссылка</div>
                </button>
                <button
                  onClick={() => setType('service')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    type === 'service'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🎁</div>
                  <div className="text-sm font-medium">Услуга</div>
                </button>
              </div>
            </div>

            {/* Название */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Название
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Чек-лист: 10 признаков тревоги"
                maxLength={100}
              />
              <p className="text-xs text-gray-500">{title.length}/100</p>
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Описание
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Узнайте основные признаки тревожного расстройства..."
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500">{description.length}/200</p>
            </div>

            {/* Поле в зависимости от типа */}
            {type === 'file' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Файл (PDF, макс 10MB)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload size={16} className="mr-2" />
                  {file ? file.name : 'Выбрать файл'}
                </Button>
              </div>
            )}

            {type === 'link' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Ссылка
                </label>
                <Input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>
            )}

            {type === 'service' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  ℹ️ Клиент заполнит форму заявки, которая придёт вам в &quot;Мои заявки&quot; 
                  с пометкой &quot;Лид-магнит&quot;
                </p>
              </div>
            )}

            {/* Emoji */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Иконка (опционально)
              </label>
              <Input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🎁"
                maxLength={2}
              />
            </div>

            {/* Действия */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSaving || !title.trim() || !description.trim()}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Добавить
                  </>
                )}
              </Button>
              <Button
                onClick={onClose}
                disabled={isSaving}
                variant="outline"
              >
                Отмена
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

