/**
 * Отображение лид-магнитов в профиле специалиста
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, Gift } from 'lucide-react'
import { LeadMagnetRequestModal } from './LeadMagnetRequestModal'

interface LeadMagnet {
  id: string
  type: 'file' | 'link' | 'service'
  title: string
  description: string
  fileUrl?: string | null
  linkUrl?: string | null
  emoji: string
}

interface SpecialistLeadMagnetsProps {
  leadMagnets: LeadMagnet[]
  specialistId: string
  specialistName: string
}

export function SpecialistLeadMagnets({
  leadMagnets,
  specialistId,
  specialistName,
}: SpecialistLeadMagnetsProps) {
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null)

  const handleClick = (magnet: LeadMagnet) => {
    if (magnet.type === 'file' && magnet.fileUrl) {
      // Скачивание файла
      window.open(magnet.fileUrl, '_blank')
      trackAction(magnet.id, 'download')
    } else if (magnet.type === 'link' && magnet.linkUrl) {
      // Переход по ссылке
      window.open(magnet.linkUrl, '_blank')
      trackAction(magnet.id, 'view')
    } else if (magnet.type === 'service') {
      // Открываем модалку заявки
      setSelectedMagnet(magnet)
    }
  }

  const trackAction = async (id: string, action: 'view' | 'download') => {
    try {
      await fetch(`/api/lead-magnets/${id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
    } catch (error) {
      console.error('Ошибка трекинга:', error)
    }
  }

  const getButtonLabel = (type: string) => {
    switch (type) {
      case 'file': return 'Скачать'
      case 'link': return 'Смотреть'
      case 'service': return 'Записаться'
      default: return 'Получить'
    }
  }

  const getButtonIcon = (type: string) => {
    switch (type) {
      case 'file': return Download
      case 'link': return ExternalLink
      case 'service': return Gift
      default: return Gift
    }
  }

  if (leadMagnets.length === 0) {
    return null
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              🎁 Бесплатные материалы
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Полезные ресурсы от {specialistName.split(' ')[0]}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leadMagnets.map((magnet, index) => {
                const ButtonIcon = getButtonIcon(magnet.type)
                
                return (
                  <motion.div
                    key={magnet.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-2xl">{magnet.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {magnet.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {magnet.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleClick(magnet)}
                      size="sm"
                      className="w-full gap-2"
                      variant={magnet.type === 'service' ? 'default' : 'outline'}
                    >
                      <ButtonIcon size={16} />
                      {getButtonLabel(magnet.type)}
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Модалка заявки на услугу */}
      {selectedMagnet && (
        <LeadMagnetRequestModal
          isOpen={!!selectedMagnet}
          onClose={() => setSelectedMagnet(null)}
          specialistId={specialistId}
          specialistName={specialistName}
          leadMagnet={selectedMagnet}
        />
      )}
    </>
  )
}

