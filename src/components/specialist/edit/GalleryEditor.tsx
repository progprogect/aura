/**
 * Редактор галереи (фото/видео)
 */

'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Upload, Loader2, Image as ImageIcon, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GalleryItem {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnailUrl?: string | null
  caption?: string | null
}

interface GalleryEditorProps {
  items: GalleryItem[]
  onRefresh: () => void
}

export function GalleryEditor({ items, onRefresh }: GalleryEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Проверка размера (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 10MB')
      return
    }

    // Проверка типа
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      alert('Можно загружать только фото или видео')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', isImage ? 'photo' : 'video')

      const response = await fetch('/api/specialist/gallery', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        onRefresh()
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при загрузке файла')
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert('Ошибка при загрузке файла')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот элемент из галереи?')) return

    try {
      const response = await fetch(`/api/specialist/gallery/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRefresh()
      } else {
        alert('Ошибка при удалении')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка при удалении')
    }
  }

  return (
    <div className="space-y-4">
      {/* Существующие элементы галереи */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
            >
              {/* Превью */}
              {item.type === 'photo' ? (
                <img
                  src={item.url}
                  alt={item.caption || ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <Video className="w-12 h-12 text-white opacity-50" />
                </div>
              )}

              {/* Кнопка удаления */}
              <button
                onClick={() => handleDelete(item.id)}
                className="
                  absolute top-2 right-2
                  p-1.5 bg-red-600 text-white rounded-full
                  opacity-0 group-hover:opacity-100
                  transition-opacity
                  hover:bg-red-700
                "
              >
                <Trash2 size={14} />
              </button>

              {/* Тип элемента */}
              <div className="absolute bottom-2 left-2">
                <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-md">
                  {item.type === 'photo' ? '📸 Фото' : '🎥 Видео'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Кнопка загрузки */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          variant="outline"
          className="w-full border-dashed border-2 hover:border-blue-400 hover:bg-blue-50"
          size="lg"
        >
          {isUploading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Загрузка... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload size={18} className="mr-2" />
              Загрузить фото или видео
            </>
          )}
        </Button>
      </div>

      {/* Подсказка */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
        <p className="text-xs text-blue-900">
          💡 <strong>Галерея повышает доверие</strong> - покажите свой кабинет, 
          рабочее пространство или процесс работы.
        </p>
        <div className="text-xs text-blue-700 space-y-1">
          <p>✅ Фото: JPG, PNG, WebP (макс 10MB)</p>
          <p>✅ Видео: MP4, WebM (макс 10MB)</p>
          <p>📸 Рекомендуется: 3-6 качественных фотографий</p>
        </div>
      </div>
    </div>
  )
}

