/**
 * Список лид-магнитов специалиста в dashboard
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Gift, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LeadMagnetModal } from '../edit/LeadMagnetModal'
import { LEAD_MAGNET_LIMITS } from '@/lib/lead-magnets/constants'
import { fromPrismaLeadMagnet } from '@/types/lead-magnet'
import type { LeadMagnetUI, EditableLeadMagnet } from '@/types/lead-magnet'

interface LeadMagnetsListProps {
  leadMagnets: LeadMagnetUI[]
  onRefresh?: () => void
  specialistSlug?: string
}

export function LeadMagnetsList({ leadMagnets: initialLeadMagnets, onRefresh, specialistSlug }: LeadMagnetsListProps) {
  const [leadMagnets, setLeadMagnets] = useState(initialLeadMagnets)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMagnet, setEditingMagnet] = useState<EditableLeadMagnet | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Синхронизация с пропсами (если данные обновятся извне через router.refresh)
  useEffect(() => {
    setLeadMagnets(initialLeadMagnets)
  }, [initialLeadMagnets])

  // Функция для загрузки свежих данных через API
  const fetchLeadMagnets = async () => {
    try {
      const response = await fetch('/api/specialist/lead-magnets')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.leadMagnets) {
          // Конвертируем Prisma объекты в типизированные LeadMagnetUI
          const convertedLeadMagnets = data.leadMagnets.map((lm: any) => fromPrismaLeadMagnet(lm)) as LeadMagnetUI[]
          setLeadMagnets(convertedLeadMagnets)
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки лид-магнитов:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот лид-магнит? Он больше не будет отображаться в профиле.')) {
      return
    }

    setDeletingId(id)
    
    try {
      const response = await fetch(`/api/specialist/lead-magnets/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Оптимистичное обновление UI
        setLeadMagnets(prev => prev.filter(m => m.id !== id))
        // Загружаем свежие данные для консистентности
        await fetchLeadMagnets()
        // Обновляем кеш Next.js (onRefresh уже вызывает router.refresh)
        onRefresh?.()
      } else {
        alert('Ошибка удаления лид-магнита')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка удаления лид-магнита')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (magnet: LeadMagnetUI) => {
    // Преобразуем LeadMagnetUI в EditableLeadMagnet
    const editableMagnet: EditableLeadMagnet = {
      id: magnet.id,
      type: magnet.type,
      title: magnet.title,
      description: magnet.description,
      fileUrl: magnet.fileUrl || null,
      linkUrl: magnet.linkUrl || null,
      emoji: magnet.emoji,
      highlights: magnet.highlights || [],
      targetAudience: magnet.targetAudience || null,
      previewUrls: magnet.previewUrls || null,
      customPreview: magnet.customPreview || false,
    }
    setEditingMagnet(editableMagnet)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingMagnet(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingMagnet(null)
  }

  const handleModalSuccess = async () => {
    setIsModalOpen(false)
    setEditingMagnet(null)
    
    // Загружаем свежие данные через API для мгновенного отображения
    await fetchLeadMagnets()
    
    // Обновляем кеш Next.js (onRefresh уже вызывает router.refresh)
    onRefresh?.()
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
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600">
              {leadMagnets.length} из {LEAD_MAGNET_LIMITS.MAX_COUNT} лид-магнитов
            </p>
          </div>
          <Button
            onClick={handleAdd}
            disabled={leadMagnets.length >= LEAD_MAGNET_LIMITS.MAX_COUNT}
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Добавить материал
          </Button>
        </div>

        {/* Empty state */}
        {leadMagnets.length === 0 && (
          <div className="text-center py-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-300">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Создайте полезные материалы
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Привлекайте клиентов полезными материалами: чек-листы, гайды, видео, бесплатные консультации.
            </p>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Создать первый материал
            </Button>
          </div>
        )}

        {/* Lead magnets grid */}
        {leadMagnets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leadMagnets.map((magnet, index) => {
              return (
                <motion.div
                  key={magnet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-4 hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-2xl">{magnet.emoji}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                            {magnet.title}
                          </h4>
                        </div>
                        <Badge variant="secondary" className="text-xs mb-1">
                          {getTypeLabel(magnet.type)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2 sm:line-clamp-3">
                    {magnet.description}
                  </p>

                  {/* Highlights */}
                  {magnet.highlights && magnet.highlights.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {magnet.highlights.slice(0, 2).map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                          <span className="text-purple-600 mt-0.5 shrink-0">•</span>
                          <span className="line-clamp-1">{highlight}</span>
                        </div>
                      ))}
                      {magnet.highlights.length > 2 && (
                        <p className="text-xs text-gray-500 pl-4">
                          +{magnet.highlights.length - 2} ещё
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats (если есть) */}
                  {(magnet.viewCount !== undefined || magnet.downloadCount !== undefined) && (
                    <div className="mb-3 flex items-center gap-3 text-xs text-gray-600">
                      {magnet.viewCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <span>👁️</span>
                          {magnet.viewCount}
                        </div>
                      )}
                      {magnet.downloadCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <span>⬇️</span>
                          {magnet.downloadCount}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-purple-200">
                    {specialistSlug && magnet.slug && (
                      <Link
                        href={`/specialist/${specialistSlug}/resources/${magnet.slug}`}
                        target="_blank"
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1 text-xs px-2 sm:px-3"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="hidden xs:inline">Посмотреть</span>
                        </Button>
                      </Link>
                    )}
                    <Button
                      onClick={() => handleEdit(magnet)}
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 text-xs px-2 sm:px-3"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="hidden xs:inline">Редактировать</span>
                    </Button>
                    <Button
                      onClick={() => handleDelete(magnet.id)}
                      disabled={deletingId === magnet.id}
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-600 hover:text-red-700 hover:border-red-300 text-xs px-2 sm:px-3"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden xs:inline">Удалить</span>
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Модальное окно */}
      <LeadMagnetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingMagnet={editingMagnet}
      />
    </>
  )
}

