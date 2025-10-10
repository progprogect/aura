/**
 * Карточка лид-магнита с превью (современный UX 2025)
 * Адаптивный дизайн: горизонтальная на мобилке, вертикальная на desktop
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeadMagnetUI } from '@/types/lead-magnet'
import { 
  getPreviewGradient, 
  getFileIcon, 
  getFileExtension,
  formatCardMeta,
  getAudienceBadgeColor,
  isYouTubeUrl,
  getYouTubeThumbnail,
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
  const gradient = getPreviewGradient(leadMagnet.type, fileExtension)
  const FileIcon = getFileIcon(fileExtension)
  const metaText = formatCardMeta(leadMagnet.type, leadMagnet.fileSize, leadMagnet.downloadCount, fileExtension)
  const audienceBadgeColor = getAudienceBadgeColor(leadMagnet.targetAudience)
  const valueBadges = getValueBadges(leadMagnet)
  
  // Проверяем является ли это YouTube видео
  const isYouTube = leadMagnet.type === 'link' && leadMagnet.linkUrl && isYouTubeUrl(leadMagnet.linkUrl)
  const youtubeThumbnail = isYouTube && leadMagnet.linkUrl ? getYouTubeThumbnail(leadMagnet.linkUrl) : null

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
          "group block bg-white rounded-xl border border-gray-200 overflow-hidden",
          "hover:shadow-lg hover:border-gray-300 hover:-translate-y-1",
          "transition-all duration-300 ease-out",
          // Mobile: горизонтальная карточка
          "flex flex-row md:hidden"
        )}
      >
        {/* Превью - слева на мобилке */}
        <div className={cn(
          "flex-shrink-0 w-20 h-20 md:w-full md:h-40 relative overflow-hidden rounded-lg md:rounded-t-xl md:rounded-b-none",
          !youtubeThumbnail && !leadMagnet.ogImage && "bg-gradient-to-br flex items-center justify-center",
          !youtubeThumbnail && !leadMagnet.ogImage && gradient
        )}>
          {/* YouTube Thumbnail с play button */}
          {youtubeThumbnail ? (
            <>
              <Image
                src={youtubeThumbnail}
                alt={leadMagnet.title}
                fill
                className="object-cover"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="bg-red-600 rounded-full p-3 group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
            </>
          ) : leadMagnet.ogImage ? (
            // OG Image для обычных ссылок
            <Image
              src={leadMagnet.ogImage}
              alt={leadMagnet.title}
              fill
              className="object-cover"
            />
          ) : leadMagnet.emoji ? (
            // Emoji если задан
            <div className="text-3xl">{leadMagnet.emoji}</div>
          ) : (
            // Иконка файла как fallback
            <FileIcon className="w-8 h-8 text-white" />
          )}
          
          {/* Value badges в углу превью */}
          {valueBadges.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {valueBadges.map((badge, i) => (
                <span
                  key={i}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium shadow-sm",
                    badge.color
                  )}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Контент - справа на мобилке */}
        <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1.5 line-clamp-1 group-hover:text-gray-700">
            {leadMagnet.title}
          </h3>
          {leadMagnet.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
              {leadMagnet.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
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
      </Link>

      {/* Desktop версия - вертикальная карточка */}
      <Link 
        href={href}
        className={cn(
          "group hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden relative",
          "hover:shadow-lg hover:border-gray-300 hover:-translate-y-1",
          "transition-all duration-300 ease-out"
        )}
      >
        {/* Превью - сверху на desktop */}
        <div className={cn(
          "w-full h-40 relative overflow-hidden",
          !youtubeThumbnail && !leadMagnet.ogImage && "bg-gradient-to-br flex items-center justify-center",
          !youtubeThumbnail && !leadMagnet.ogImage && gradient
        )}>
          {/* YouTube Thumbnail с play button */}
          {youtubeThumbnail ? (
            <>
              <Image
                src={youtubeThumbnail}
                alt={leadMagnet.title}
                fill
                className="object-cover"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
              </div>
            </>
          ) : leadMagnet.ogImage ? (
            // OG Image для обычных ссылок
            <Image
              src={leadMagnet.ogImage}
              alt={leadMagnet.title}
              fill
              className="object-cover"
            />
          ) : leadMagnet.emoji ? (
            // Emoji если задан
            <div className="text-5xl">{leadMagnet.emoji}</div>
          ) : (
            // Иконка файла как fallback
            <FileIcon className="w-12 h-12 text-white" />
          )}
          
          {/* Value badges в углу превью */}
          {valueBadges.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {valueBadges.map((badge, i) => (
                <span
                  key={i}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium shadow-sm",
                    badge.color
                  )}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Контент - снизу на desktop */}
        <div className="p-4 flex flex-col h-[140px]">
          <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2 line-clamp-1 group-hover:text-gray-700">
            {leadMagnet.title}
          </h3>
          {leadMagnet.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed flex-1">
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
        
        {/* Интерактивный hover overlay с дополнительной информацией */}
        {leadMagnet.highlights && leadMagnet.highlights.length > 0 && (
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/95 via-blue-800/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
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
