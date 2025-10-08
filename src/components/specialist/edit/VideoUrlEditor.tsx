/**
 * Редактор URL видео-презентации
 */

'use client'

import { useState } from 'react'
import { Video, Check, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface VideoUrlEditorProps {
  videoUrl: string | null | undefined
  onSave: (field: string, value: string) => Promise<any>
  onRemove?: () => Promise<void>
}

export function VideoUrlEditor({ videoUrl, onSave, onRemove }: VideoUrlEditorProps) {
  const [isEditing, setIsEditing] = useState(!videoUrl)
  const [url, setUrl] = useState(videoUrl || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState('')

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false
    
    // Проверка на YouTube или Vimeo URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/
    
    return youtubeRegex.test(url) || vimeoRegex.test(url)
  }

  const handleSave = async () => {
    const trimmedUrl = url.trim()
    
    if (!validateUrl(trimmedUrl)) {
      setError('Введите корректную ссылку на YouTube или Vimeo')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await onSave('videoUrl', trimmedUrl)
      setIsSaved(true)
      setIsEditing(false)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (err) {
      setError('Ошибка сохранения. Попробуйте снова.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveVideo = async () => {
    if (!onRemove) return
    
    setIsSaving(true)
    try {
      await onRemove()
      setUrl('')
      setIsEditing(true)
    } catch (err) {
      setError('Ошибка удаления видео')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEditing && videoUrl) {
    return (
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Video className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Видео добавлено
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {videoUrl}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                Изменить
              </button>
              {onRemove && (
                <button
                  onClick={handleRemoveVideo}
                  disabled={isSaving}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {isSaved && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <Check size={16} />
            Сохранено
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2 mb-3">
          <Video className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Добавьте ссылку на видео-презентацию
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Поддерживаются YouTube и Vimeo
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError('')
            }}
            className={`w-full ${error ? 'border-red-500' : ''}`}
          />
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !url.trim()}
              className="
                px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium
                hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors flex items-center gap-2
              "
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Сохранить
                </>
              )}
            </button>
            
            {videoUrl && (
              <button
                onClick={() => {
                  setIsEditing(false)
                  setUrl(videoUrl)
                  setError('')
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

