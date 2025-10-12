/**
 * Модальное окно добавления лид-магнита
 */

'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PreviewUploader } from './PreviewUploader'
import { FallbackPreview } from './FallbackPreview'
import { CropModal } from './CropModal'
import { isSquareImage, getPreviewUrl } from '@/lib/lead-magnets/preview-utils'
import { LEAD_MAGNET_LIMITS, DEFAULT_EMOJI } from '@/lib/lead-magnets/constants'
import type { EditableLeadMagnet } from '@/types/lead-magnet'

interface LeadMagnetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingMagnet?: EditableLeadMagnet | null
}

export function LeadMagnetModal({ isOpen, onClose, onSuccess, editingMagnet }: LeadMagnetModalProps) {
  const [type, setType] = useState<'file' | 'link' | 'service'>('file')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [emoji, setEmoji] = useState<string>(DEFAULT_EMOJI)
  const [file, setFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Новые поля
  const [highlights, setHighlights] = useState<string[]>([''])
  const [targetAudience, setTargetAudience] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Превью state
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [tempImageForCrop, setTempImageForCrop] = useState<string | null>(null)
  const [existingPreviewUrl, setExistingPreviewUrl] = useState<string | null>(null)
  const [previewRemoved, setPreviewRemoved] = useState(false)

  // Инициализация данных при редактировании
  React.useEffect(() => {
    if (editingMagnet) {
      setType(editingMagnet.type)
      setTitle(editingMagnet.title)
      setDescription(editingMagnet.description)
      setLinkUrl(editingMagnet.linkUrl || '')
      setEmoji(editingMagnet.emoji)
      setFile(null)
      // Инициализация новых полей
      setHighlights(editingMagnet.highlights && editingMagnet.highlights.length > 0 ? editingMagnet.highlights : [''])
      setTargetAudience(editingMagnet.targetAudience || '')
      setShowAdvanced(!!editingMagnet.highlights?.length || !!editingMagnet.targetAudience)
      
      // Инициализация превью
      const previewUrl = getPreviewUrl(editingMagnet.previewUrls, 'card')
      setExistingPreviewUrl(previewUrl)
      setPreviewFile(null)
      setPreviewDataUrl(null)
    } else {
      resetForm()
    }
  }, [editingMagnet, isOpen])

  const handleSubmit = async () => {
    // Улучшенная валидация с указанием требований
    if (!title.trim()) {
      alert(`Название обязательно (минимум ${LEAD_MAGNET_LIMITS.TITLE_MIN_LENGTH} символов)`)
      return
    }

    if (title.trim().length < LEAD_MAGNET_LIMITS.TITLE_MIN_LENGTH) {
      alert(`Название должно содержать минимум ${LEAD_MAGNET_LIMITS.TITLE_MIN_LENGTH} символов`)
      return
    }

    if (!description.trim()) {
      alert(`Описание обязательно (минимум ${LEAD_MAGNET_LIMITS.DESCRIPTION_MIN_LENGTH} символов)`)
      return
    }

    if (description.trim().length < LEAD_MAGNET_LIMITS.DESCRIPTION_MIN_LENGTH) {
      alert(`Описание должно содержать минимум ${LEAD_MAGNET_LIMITS.DESCRIPTION_MIN_LENGTH} символов`)
      return
    }

    if (type === 'link') {
      if (!linkUrl.trim()) {
        alert('Укажите ссылку')
        return
      }
      
      // Проверяем, является ли строка валидным URL
      try {
        new URL(linkUrl.trim())
      } catch {
        alert('Укажите корректную ссылку (например: https://example.com)')
        return
      }
    }

    if (type === 'file' && !file && !editingMagnet?.fileUrl) {
      alert('Загрузите файл')
      return
    }

    setIsSaving(true)

    try {
      const isEditing = !!editingMagnet
      const url = isEditing ? `/api/specialist/lead-magnets/${editingMagnet.id}` : '/api/specialist/lead-magnets'
      const method = isEditing ? 'PUT' : 'POST'

      // Подготовка highlights (убираем пустые)
      const cleanHighlights = highlights.filter(h => h.trim() !== '')
      
      // Используем FormData если есть file или previewFile
      const useFormData = (type === 'file' && file && file.size > 0) || (previewFile && previewFile.size > 0)
      
      if (useFormData) {
        const formData = new FormData()
        
        // Основные поля
        formData.append('type', type)
        formData.append('title', title.trim())
        formData.append('description', description.trim())
        formData.append('emoji', emoji)
        formData.append('highlights', JSON.stringify(cleanHighlights))
        if (targetAudience.trim()) {
          formData.append('targetAudience', targetAudience.trim())
        }

        // Файл лид-магнита (только если не пустой)
        if (type === 'file' && file && file.size > 0) {
          formData.append('file', file)
        } else if (type === 'file' && editingMagnet?.fileUrl) {
          formData.append('fileUrl', editingMagnet.fileUrl)
        }

        // Ссылка (если есть)
        if (type === 'link' && linkUrl.trim()) {
          formData.append('linkUrl', linkUrl.trim())
        }

        // Превью файл (только если не пустой)
        if (previewFile && previewFile.size > 0) {
          formData.append('previewFile', previewFile)
        } else if (previewRemoved) {
          // Если превью было удалено, отправляем флаг
          formData.append('removePreview', 'true')
        }

        const response = await fetch(url, {
          method,
          body: formData,
        })

        if (response.ok) {
          onSuccess()
          if (!isEditing) resetForm()
        } else {
          const error = await response.json()
          alert(error.error || `Ошибка ${isEditing ? 'обновления' : 'создания'}`)
        }
        return
      }

      // Для остальных случаев используем JSON
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          ...(type === 'link' && linkUrl.trim() && { linkUrl: linkUrl.trim() }),
          ...(type === 'file' && editingMagnet?.fileUrl && { fileUrl: editingMagnet.fileUrl }),
          emoji,
          highlights: cleanHighlights,
          ...(targetAudience.trim() && { targetAudience: targetAudience.trim() }),
        }),
      })

      if (response.ok) {
        onSuccess()
        if (!isEditing) resetForm()
      } else {
        const error = await response.json()
        alert(error.error || `Ошибка ${isEditing ? 'обновления' : 'создания'}`)
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert(`Ошибка ${editingMagnet ? 'обновления' : 'создания'} лид-магнита`)
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setType('file')
    setTitle('')
    setDescription('')
    setLinkUrl('')
    setEmoji(DEFAULT_EMOJI)
    setFile(null)
    setHighlights([''])
    setTargetAudience('')
    setShowAdvanced(false)
    setPreviewFile(null)
    setPreviewDataUrl(null)
    setExistingPreviewUrl(null)
    setShowCropModal(false)
    setTempImageForCrop(null)
  }

  // Обработчик выбора превью
  const handlePreviewFileSelect = async (file: File, dataUrl: string) => {
    // Проверяем, квадратное ли изображение
    const isSquare = await isSquareImage(file)
    
    if (isSquare) {
      // Квадратное - сразу устанавливаем
      setPreviewFile(file)
      setPreviewDataUrl(dataUrl)
      setPreviewRemoved(false) // Сбрасываем флаг удаления
    } else {
      // Не квадратное - показываем crop modal
      setTempImageForCrop(dataUrl)
      setShowCropModal(true)
    }
  }

  // Обработчик завершения crop
  const handleCropComplete = (croppedBlob: Blob) => {
    // Конвертируем Blob в File
    const croppedFile = new File([croppedBlob], 'preview.jpg', { type: 'image/jpeg' })
    const croppedDataUrl = URL.createObjectURL(croppedBlob)
    
    setPreviewFile(croppedFile)
    setPreviewDataUrl(croppedDataUrl)
    setPreviewRemoved(false) // Сбрасываем флаг удаления
    setShowCropModal(false)
    setTempImageForCrop(null)
  }

  // Обработчик удаления превью
  const handlePreviewRemove = () => {
    setPreviewFile(null)
    setPreviewDataUrl(null)
    setExistingPreviewUrl(null)
    setPreviewRemoved(true) // Отмечаем, что превью было удалено
  }
  
  const addHighlight = () => {
    if (highlights.length < LEAD_MAGNET_LIMITS.MAX_HIGHLIGHTS) {
      setHighlights([...highlights, ''])
    }
  }
  
  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...highlights]
    newHighlights[index] = value
    setHighlights(newHighlights)
  }
  
  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Проверка на пустой файл
    if (selectedFile.size === 0) {
      alert('Файл пустой. Выберите корректный файл')
      return
    }

    // Проверка размера
    if (selectedFile.size > LEAD_MAGNET_LIMITS.MAX_FILE_SIZE) {
      const maxSizeMB = (LEAD_MAGNET_LIMITS.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)
      alert(`Файл слишком большой (макс ${maxSizeMB}MB)`)
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
              {editingMagnet ? 'Редактировать лид-магнит' : 'Добавить лид-магнит'}
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
                Название <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Чек-лист: 10 признаков тревоги"
                maxLength={LEAD_MAGNET_LIMITS.TITLE_MAX_LENGTH}
              />
              <p className="text-xs text-gray-500">
                Минимум {LEAD_MAGNET_LIMITS.TITLE_MIN_LENGTH} символов. Сейчас: {title.length}/{LEAD_MAGNET_LIMITS.TITLE_MAX_LENGTH}
                {title.length > 0 && title.length < LEAD_MAGNET_LIMITS.TITLE_MIN_LENGTH && (
                  <span className="text-red-500 ml-2">⚠️ Слишком коротко</span>
                )}
              </p>
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Описание <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Узнайте основные признаки тревожного расстройства..."
                rows={3}
                maxLength={LEAD_MAGNET_LIMITS.DESCRIPTION_MAX_LENGTH}
              />
              <p className="text-xs text-gray-500">
                Минимум {LEAD_MAGNET_LIMITS.DESCRIPTION_MIN_LENGTH} символов. Сейчас: {description.length}/{LEAD_MAGNET_LIMITS.DESCRIPTION_MAX_LENGTH}
                {description.length > 0 && description.length < LEAD_MAGNET_LIMITS.DESCRIPTION_MIN_LENGTH && (
                  <span className="text-red-500 ml-2">⚠️ Слишком коротко</span>
                )}
              </p>
            </div>

            {/* Поле в зависимости от типа */}
            {type === 'file' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Файл (PDF, макс {(LEAD_MAGNET_LIMITS.MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB)
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
                  Ссылка <span className="text-red-500">*</span>
                </label>
                <Input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                />
                <p className="text-xs text-gray-500">
                  {linkUrl && linkUrl.trim() ? (
                    (() => {
                      try {
                        new URL(linkUrl.trim())
                        return <span className="text-green-600">✅ Корректная ссылка</span>
                      } catch {
                        return <span className="text-red-500">⚠️ Неверный формат URL</span>
                      }
                    })()
                  ) : (
                    'Введите ссылку (например: https://example.com)'
                  )}
                </p>
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

            {/* Превью */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <label className="text-sm font-medium text-gray-900">
                Превью (опционально)
              </label>
              
              {previewDataUrl || existingPreviewUrl ? (
                <PreviewUploader
                  onFileSelect={handlePreviewFileSelect}
                  onFileRemove={handlePreviewRemove}
                  currentPreview={previewDataUrl || existingPreviewUrl}
                  disabled={isSaving}
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* Загрузка кастомного */}
                  <div>
                    <PreviewUploader
                      onFileSelect={handlePreviewFileSelect}
                      onFileRemove={handlePreviewRemove}
                      currentPreview={null}
                      disabled={isSaving}
                    />
                  </div>
                  
                  {/* Fallback preview */}
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2 text-center">
                      Или будет использовано стандартное превью:
                    </div>
                    <FallbackPreview />
                  </div>
                </div>
              )}
            </div>

            {/* Дополнительно (секция скрыта по умолчанию) */}
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                {showAdvanced ? '▼' : '▶'} Дополнительно (опционально)
              </button>
              
              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  {/* Что внутри (highlights) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      Что внутри (по пунктам, максимум {LEAD_MAGNET_LIMITS.MAX_HIGHLIGHTS})
                    </label>
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={highlight}
                          onChange={(e) => updateHighlight(index, e.target.value)}
                          placeholder={`Пункт ${index + 1}`}
                          className="flex-1"
                        />
                        {highlights.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeHighlight(index)}
                            className="px-3"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    ))}
                    {highlights.length < LEAD_MAGNET_LIMITS.MAX_HIGHLIGHTS && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addHighlight}
                        className="w-full"
                      >
                        + Добавить пункт
                      </Button>
                    )}
                  </div>

                  {/* Для кого */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                      Для кого
                    </label>
                    <Input
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Для новичков"
                      maxLength={LEAD_MAGNET_LIMITS.TARGET_AUDIENCE_MAX_LENGTH}
                    />
                  </div>
                </div>
              )}
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

        {/* Crop Modal */}
        {showCropModal && tempImageForCrop && (
          <CropModal
            isOpen={showCropModal}
            imageUrl={tempImageForCrop}
            onCropComplete={handleCropComplete}
            onClose={() => {
              setShowCropModal(false)
              setTempImageForCrop(null)
            }}
          />
        )}
      </div>
    </AnimatePresence>
  )
}

