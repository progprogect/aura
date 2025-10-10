'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getLeadMagnetBadgeColor } from '@/lib/lead-magnets/preview'
import type { LeadMagnet } from '@/types/lead-magnet'

interface SlideContentProps {
  leadMagnet: Pick<LeadMagnet, 'title' | 'description' | 'type' | 'targetAudience' | 'fileSize' | 'downloadCount' | 'highlights'>
  className?: string
}

// Компонент для мета-информации (бейджи)
function MetaBadges({ 
  type, 
  targetAudience, 
  fileSize, 
  downloadCount 
}: {
  type: 'file' | 'link' | 'service'
  targetAudience?: string | null
  fileSize?: string | null
  downloadCount?: number
}) {
  const badges = []

  // Бейдж типа
  badges.push({
    label: type === 'file' ? 'Файл' : type === 'link' ? 'Ссылка' : 'Сервис',
    color: getLeadMagnetBadgeColor(type)
  })

  // Бейдж аудитории
  if (targetAudience) {
    badges.push({
      label: targetAudience,
      color: 'bg-blue-100 text-blue-800'
    })
  }

  // Бейдж размера файла
  if (fileSize) {
    badges.push({
      label: fileSize,
      color: 'bg-gray-100 text-gray-700'
    })
  }

  // Бейдж количества скачиваний (если больше 10)
  if (downloadCount && downloadCount > 10) {
    badges.push({
      label: `${downloadCount} скачиваний`,
      color: 'bg-green-100 text-green-800'
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <span
          key={index}
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            badge.color
          )}
        >
          {badge.label}
        </span>
      ))}
    </div>
  )
}

// Компонент для списка highlights
function HighlightsList({ highlights }: { highlights: string[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">
        Что внутри:
      </h3>
      <ul className="space-y-2">
        {highlights.map((highlight, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start space-x-3"
          >
            <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <span className="text-gray-700 leading-relaxed">{highlight}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

export function SlideContent({ leadMagnet, className }: SlideContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn("space-y-6", className)}
    >
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          {leadMagnet.title}
        </h1>
      </div>

      {/* Описание */}
      {leadMagnet.description && (
        <div>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            {leadMagnet.description}
          </p>
        </div>
      )}

      {/* Мета-информация (бейджи) */}
      <div>
        <MetaBadges
          type={leadMagnet.type}
          targetAudience={leadMagnet.targetAudience}
          fileSize={leadMagnet.fileSize}
          downloadCount={leadMagnet.downloadCount}
        />
      </div>

      {/* Highlights (если есть) */}
      {leadMagnet.highlights && leadMagnet.highlights.length > 0 && (
        <div>
          <HighlightsList highlights={leadMagnet.highlights} />
        </div>
      )}
    </motion.div>
  )
}
