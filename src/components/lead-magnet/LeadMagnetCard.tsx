/**
 * Карточка лид-магнита с превью (современный UX 2025)
 * Адаптивный дизайн: вертикальная структура на всех устройствах
 * Превью: h-32 (mobile) → h-36 (tablet) → h-40 (desktop)
 */

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LeadMagnetUI } from '@/types/lead-magnet'
import { CardPreview } from './CardPreview'
import { 
  getFileExtension,
  formatCardMeta,
  getAudienceBadgeColor,
  getValueBadges
} from '@/lib/lead-magnets/preview'

interface LeadMagnetCardProps {
  leadMagnet: LeadMagnetUI
  specialistSlug: string
  index: number
}

export function LeadMagnetCard({ leadMagnet, specialistSlug, index }: LeadMagnetCardProps) {
  const href = `/specialist/${specialistSlug}/resources/${leadMagnet.slug}`
  const fileExtension = getFileExtension(leadMagnet.fileUrl)
  // Для файлов с emoji не показываем техническую информацию
  const metaText = leadMagnet.emoji 
    ? formatCardMeta(leadMagnet.type, undefined, leadMagnet.downloadCount, undefined)
    : formatCardMeta(leadMagnet.type, leadMagnet.fileSize, leadMagnet.downloadCount, fileExtension)
  const audienceBadgeColor = getAudienceBadgeColor(leadMagnet.targetAudience)
  const valueBadges = getValueBadges(leadMagnet)

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
            leadMagnet={leadMagnet} 
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
        <div className="p-3 sm:p-4 flex flex-col min-h-[100px] sm:min-h-[120px] md:min-h-[140px]">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight mb-1.5 sm:mb-2 line-clamp-1 group-hover:text-gray-700">
            {leadMagnet.title}
          </h3>
          {leadMagnet.description && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 leading-relaxed flex-1">
              {leadMagnet.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap mt-auto">
            <span className="text-xs text-gray-500">
              {metaText}
            </span>
            {leadMagnet.targetAudience && (
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                audienceBadgeColor
              )}>
                {leadMagnet.targetAudience}
              </span>
            )}
          </div>
        </div>
        
        {/* Интерактивный hover overlay с дополнительной информацией (только desktop) */}
        {leadMagnet.highlights && leadMagnet.highlights.length > 0 && (
          <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-blue-900/95 via-blue-800/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-4 pointer-events-none">
            <div className="text-white space-y-2">
              <div className="text-sm font-semibold">Что внутри:</div>
              <div className="text-sm opacity-90">
                ✓ {leadMagnet.highlights[0]}
              </div>
              {leadMagnet.highlights.length > 1 && (
                <div className="text-xs opacity-75">
                  и ещё {leadMagnet.highlights.length - 1} пункт{leadMagnet.highlights.length === 2 ? '' : leadMagnet.highlights.length > 4 ? 'ов' : 'а'}
                </div>
              )}
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}
