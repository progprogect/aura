/**
 * Компонент для загрузки аватара
 * Поддерживает drag & drop и выбор файла
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Loader2, Check, X, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

interface AvatarUploaderProps {
  currentAvatar?: string | null
  onUploadSuccess: () => void
}

export function AvatarUploader({ currentAvatar, onUploadSuccess }: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Проверяем настройку Cloudinary на клиенте
  useEffect(() => {
    fetch('/api/specialist/avatar', {
      method: 'OPTIONS'
    }).catch(() => {
      setCloudinaryConfigured(false)
    })
  }, [])

  // Конвертация файла в base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Обработка выбранного файла
  const handleFileSelect = async (file: File) => {
    // Валидация типа
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение')
      return
    }

    // Валидация размера (макс 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('Файл слишком большой (максимум 20 МБ)')
      return
    }

    setError('')
    setIsUploading(true)

    try {
      const base64 = await fileToBase64(file)
      setPreview(base64)

      // Загружаем в Cloudinary
      const response = await fetch('/api/specialist/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      })

      const result = await response.json()

      if (result.success) {
        onUploadSuccess()
      } else {
        setError(result.error || 'Ошибка загрузки')
        setPreview(null)
      }
    } catch (err) {
      setError('Произошла ошибка при загрузке')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  // Обработка drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Обработка выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Загрузка по URL
  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      setError('Введите URL изображения')
      return
    }

    setError('')
    setIsUploading(true)

    try {
      const response = await fetch('/api/specialist/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      })

      const result = await response.json()

      if (result.success) {
        setShowUrlInput(false)
        setImageUrl('')
        onUploadSuccess()
      } else {
        setError(result.error || 'Ошибка загрузки')
      }
    } catch (err) {
      setError('Произошла ошибка при загрузке')
    } finally {
      setIsUploading(false)
    }
  }

  const displayAvatar = preview || currentAvatar

  return (
    <div className="space-y-4">
      {/* Превью */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Текущий аватар */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt="Аватар"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Upload size={40} />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Кнопки загрузки */}
        <div className="flex-1 space-y-3">
          {!showUrlInput ? (
            <>
              {/* Drag & Drop зона */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="
                  border-2 border-dashed border-gray-300 rounded-lg p-6
                  hover:border-blue-400 hover:bg-blue-50/50
                  cursor-pointer transition-colors
                  text-center
                "
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Нажмите или перетащите изображение
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, GIF (макс 20 МБ)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Или по URL */}
              <Button
                variant="outline"
                onClick={() => setShowUrlInput(true)}
                className="w-full"
                type="button"
              >
                <LinkIcon size={16} className="mr-2" />
                Вставить URL изображения
              </Button>
            </>
          ) : (
            <>
              {/* URL Input */}
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleUrlUpload}
                  disabled={isUploading || !imageUrl.trim()}
                >
                  {isUploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUrlInput(false)
                    setImageUrl('')
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                💡 Вставьте ссылку на изображение из интернета
              </p>
            </>
          )}
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Подсказка о Cloudinary */}
      {!cloudinaryConfigured && !showUrlInput && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            ⚠️ Cloudinary не настроен. Загрузка файлов временно недоступна. Используйте URL изображения.
          </p>
        </div>
      )}
    </div>
  )
}

