/**
 * Редактор портфолио (фото/видео с заголовком и описанием)
 */

'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PortfolioModal } from './PortfolioModal'
import Image from 'next/image'

interface PortfolioItem {
  id: string
  type: 'photo' | 'video'
  url: string
  thumbnailUrl?: string | null
  title: string
  description?: string | null
}

interface PortfolioEditorProps {
  items: PortfolioItem[]
  onRefresh: () => void
}

export function PortfolioEditor({ items, onRefresh }: PortfolioEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAdd = () => {
    setEditingItem(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту работу из портфолио?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/specialist/portfolio/${id}`, {
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
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveSuccess = () => {
    onRefresh()
    setIsModalOpen(false)
    setEditingItem(undefined)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Существующие элементы портфолио */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                {/* Превью */}
                <div className="relative aspect-video bg-gray-100">
                  {item.type === 'photo' ? (
                    <Image
                      src={item.url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={item.url.startsWith('http')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized={item.thumbnailUrl.startsWith('http')}
                        />
                      ) : (
                        <Video className="w-12 h-12 text-white opacity-50" />
                      )}
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 truncate mb-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Кнопки действий */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    aria-label="Редактировать"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                    aria-label="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

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

        {/* Кнопка добавления */}
        <Button
          onClick={handleAdd}
          variant="outline"
          className="w-full border-dashed border-2 hover:border-blue-400 hover:bg-blue-50"
          size="lg"
        >
          <Plus size={18} className="mr-2" />
          Добавить работу в портфолио
        </Button>

        {/* Подсказка */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p className="text-xs text-blue-900">
            💡 <strong>Портфолио демонстрирует ваши работы</strong> - покажите примеры проектов, 
            результаты работы с клиентами, кейсы.
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            <p>✅ Фото: JPG, PNG, WebP (макс 10MB)</p>
            <p>✅ Видео: MP4, WebM (макс 100MB)</p>
            <p>📝 Добавьте заголовок и описание для каждой работы</p>
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      <PortfolioModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(undefined)
        }}
        portfolioItem={editingItem}
        onSave={handleSaveSuccess}
      />
    </>
  )
}

