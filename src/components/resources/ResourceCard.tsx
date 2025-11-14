/**
 * Карточка ресурса (лид-магнита) для библиотеки
 * Адаптация LeadMagnetCard с добавлением информации о специалисте
 */

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ResourceViewModel } from '@/lib/resources/types'
import { CardPreview } from '@/components/lead-magnet/CardPreview'
import { 
  getFileExtension,
  formatCardMeta,
  getAudienceBadgeColor,
  getValueBadges
} from '@/lib/lead-magnets/preview'
import { getCategoryEmoji, getCategoryLabel } from '@/lib/formatters/category'
import { useCategories } from '@/hooks/useCategories'

interface ResourceCardProps {
  resource: ResourceViewModel
  index: number
}

export function ResourceCard({ resource, index }: ResourceCardProps) {
  const { categories } = useCategories()
  const href = `/specialist/${resource.specialist.slug}/resources/${resource.slug}`
  const fileExtension = getFileExtension(resource.fileUrl)
  
  // Для файлов с emoji не показываем техническую информацию
  const metaText = resource.emoji 
    ? formatCardMeta(resource.type, undefined, resource.downloadCount, undefined)
    : formatCardMeta(resource.type, resource.fileSize, resource.downloadCount, fileExtension)
  
  const audienceBadgeColor = getAudienceBadgeColor(resource.targetAudience)
  const valueBadges = getValueBadges({
    type: resource.type,
    targetAudience: resource.targetAudience,
    downloadCount: resource.downloadCount,
  })

  // Получаем название и emoji категории
  const categoryEmoji = getCategoryEmoji(resource.specialist.category, categories || [])
  const categoryLabel = getCategoryLabel(resource.specialist.category, categories || [])

  // Преобразуем ResourceViewModel в LeadMagnetUI для CardPreview
  const leadMagnetForPreview = {
    id: resource.id,
    type: resource.type,
    title: resource.title,
    description: resource.description,
    emoji: resource.emoji,
    fileUrl: resource.fileUrl,
    linkUrl: resource.linkUrl,
    previewUrls: resource.previewUrls,
    highlights: resource.highlights,
    targetAudience: resource.targetAudience,
    fileSize: resource.fileSize,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link 
        href={href}
        className={cn(
          "group block bg-white rounded-xl border border-gray-200 overflow-hidden relative",
          "hover:shadow-lg hover:border-gray-300 hover:-translate-y-1",
          "active:scale-[0.98]",
          "transition-all duration-300 ease-out"
        )}
      >
        {/* Превью - сверху (квадратное 1:1 для всех экранов) */}
        <div className="relative w-full aspect-square overflow-hidden">
          <CardPreview 
            leadMagnet={leadMagnetForPreview}
            size="responsive"
          />
          
          {/* Value badges в углу превью */}
          {valueBadges.length > 0 && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex flex-col gap-1">
              {valueBadges.map((badge, i) => (
                <span
                  key={i}
                  className={cn(
                    "px-1.5 py-0.5 sm:px-2 rounded-full text-[10px] sm:text-xs font-medium shadow-sm",
                    badge.color
                  )}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Контент - снизу (адаптивные отступы и размеры) */}
        <div className="p-3 sm:p-4 flex flex-col min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight mb-1.5 sm:mb-2 line-clamp-1 group-hover:text-gray-700">
            {resource.title}
          </h3>
          {resource.description && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 leading-relaxed flex-1">
              {resource.description}
            </p>
          )}
          
          {/* Информация о специалисте */}
          <div className="mb-2 sm:mb-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
              <span className="font-medium text-gray-900">{resource.specialistFullName}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span aria-hidden="true">{categoryEmoji}</span>
              <span>{categoryLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-auto">
            <span className="text-xs text-gray-500">
              {metaText}
            </span>
            {resource.targetAudience && (
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                audienceBadgeColor
              )}>
                {resource.targetAudience}
              </span>
            )}
          </div>
        </div>
        
        {/* Интерактивный hover overlay с дополнительной информацией (только desktop) */}
        {resource.highlights && resource.highlights.length > 0 && (
          <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-blue-900/95 via-blue-800/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-4 pointer-events-none">
            <div className="text-white space-y-2">
              <div className="text-sm font-semibold">Что внутри:</div>
              <div className="text-sm opacity-90">
                ✓ {resource.highlights[0]}
              </div>
              {resource.highlights.length > 1 && (
                <div className="text-xs opacity-75">
                  и ещё {resource.highlights.length - 1} пункт{resource.highlights.length === 2 ? '' : resource.highlights.length > 4 ? 'ов' : 'а'}
                </div>
              )}
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}

