/**
 * Редактор лид-магнитов
 */

'use client'

import { useState } from 'react'
import { Plus, Trash2, FileText, Link as LinkIcon, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LeadMagnetModal } from './LeadMagnetModal'

interface LeadMagnet {
  id: string
  type: 'file' | 'link' | 'service'
  title: string
  description: string
  fileUrl?: string | null
  linkUrl?: string | null
  emoji: string
}

interface LeadMagnetsEditorProps {
  leadMagnets: LeadMagnet[]
  onRefresh: () => void
}

export function LeadMagnetsEditor({ leadMagnets, onRefresh }: LeadMagnetsEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот лид-магнит?')) return

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/specialist/lead-magnets/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onRefresh()
      } else {
        alert('Ошибка удаления')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка удаления')
    } finally {
      setIsDeleting(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'file': return FileText
      case 'link': return LinkIcon
      case 'service': return Gift
      default: return Gift
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'file': return '📄 Файл'
      case 'link': return '🔗 Ссылка'
      case 'service': return '🎁 Услуга'
      default: return type
    }
  }

  return (
    <div className="space-y-4">
      {/* Пояснение */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-purple-600 text-xl mt-0.5">💡</div>
          <div className="flex-1 text-sm text-purple-900">
            <p className="font-semibold mb-2">Что такое лид-магниты:</p>
            <ul className="space-y-1 text-purple-800">
              <li>• <strong>Файл</strong> - полезный материал для скачивания (чек-лист, гайд)</li>
              <li>• <strong>Ссылка</strong> - переход на видео, статью или другой контент</li>
              <li>• <strong>Услуга</strong> - бесплатная консультация или диагностика (заявка)</li>
              <li>• Помогают привлечь клиентов и показать экспертность</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Существующие лид-магниты */}
      {leadMagnets.length > 0 && (
        <div className="space-y-3">
          {leadMagnets.map((magnet) => {
            const TypeIcon = getTypeIcon(magnet.type)
            
            return (
              <div
                key={magnet.id}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-xl">{magnet.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {magnet.title}
                        </h4>
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                          {getTypeLabel(magnet.type)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {magnet.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(magnet.id)}
                    disabled={isDeleting === magnet.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Кнопка добавления */}
      {leadMagnets.length < 6 && (
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="w-full border-dashed border-2 hover:border-purple-400 hover:bg-purple-50"
          size="lg"
        >
          <Plus size={18} className="mr-2" />
          Добавить лид-магнит ({leadMagnets.length}/6)
        </Button>
      )}

      {/* Модальное окно добавления */}
      <LeadMagnetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false)
          onRefresh()
        }}
      />
    </div>
  )
}

