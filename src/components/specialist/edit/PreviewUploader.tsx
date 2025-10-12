/**
 * PreviewUploader - компонент для загрузки кастомного превью
 * С поддержкой drag-n-drop, валидации и preview
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { validatePreviewFile, fileToBase64 } from '@/lib/lead-magnets/preview-utils'
import Image from 'next/image'

interface PreviewUploaderProps {
  onFileSelect: (file: File, dataUrl: string) => void
  onFileRemove: () => void
  currentPreview?: string | null
  disabled?: boolean
}

export function PreviewUploader({
  onFileSelect,
  onFileRemove,
  currentPreview,
  disabled = false
}: PreviewUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileValidation = useCallback(async (file: File) => {
    setError(null)

    // Валидация
    const validation = validatePreviewFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Некорректный файл')
      return
    }

    try {
      // Конвертируем в base64 для preview
      const dataUrl = await fileToBase64(file)
      onFileSelect(file, dataUrl)
    } catch (error) {
      console.error('Ошибка чтения файла:', error)
      setError('Ошибка чтения файла')
    }
  }, [onFileSelect])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileValidation(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileValidation(file)
    }
  }, [disabled, handleFileValidation])

  const handleRemove = () => {
    setError(null)
    onFileRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {/* Превью или Drag-n-Drop зона */}
      {currentPreview ? (
        <div className="relative">
          {/* Preview изображения */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={currentPreview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>

          {/* Кнопка удаления */}
          {!disabled && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              title="Удалить превью"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full aspect-square rounded-lg border-2 border-dashed transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className={`mb-4 ${isDragging ? 'scale-110' : ''} transition-transform`}>
              {isDragging ? (
                <ImageIcon size={48} className="text-purple-500" />
              ) : (
                <Upload size={48} className="text-gray-400" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? 'Отпустите файл' : 'Перетащите изображение или нажмите для выбора'}
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG или WebP • Максимум 5MB
              </p>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Hint */}
      {!currentPreview && !error && (
        <div className="text-xs text-gray-500 text-center">
          {disabled 
            ? 'Загрузка...' 
            : 'Если не загрузите превью, будет создано автоматическое (emoji на цветном фоне)'
          }
        </div>
      )}
    </div>
  )
}

