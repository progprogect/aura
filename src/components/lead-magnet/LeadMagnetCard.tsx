/**
 * Карточка лид-магнита с превью (современный UX 2025)
 * Адаптивный дизайн: горизонтальная на мобилке, вертикальная на desktop
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LeadMagnetUI } from '@/types/lead-magnet'
import { 
  getPreviewGradient, 
  getFileIcon, 
  getFileExtension,
  formatCardMeta,
  getAudienceBadgeColor
} from '@/lib/lead-magnets/preview'

interface LeadMagnetCardProps {
  leadMagnet: LeadMagnetUI & {
    fileSize?: string | null
    downloadCount?: number
    targetAudience?: string | null
  }
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
          "flex-shrink-0 w-16 h-16 md:w-full md:h-32",
          "bg-gradient-to-br flex items-center justify-center",
          gradient
        )}>
          {leadMagnet.type === 'link' && leadMagnet.fileUrl ? (
            <Image
              src={leadMagnet.fileUrl}
              alt={leadMagnet.title}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileIcon className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Контент - справа на мобилке */}
        <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-gray-700">
            {leadMagnet.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">
            {metaText}
          </p>
          {leadMagnet.targetAudience && (
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit",
              audienceBadgeColor
            )}>
              {leadMagnet.targetAudience}
            </span>
          )}
        </div>
      </Link>

      {/* Desktop версия - вертикальная карточка */}
      <Link 
        href={href}
        className={cn(
          "group hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden",
          "hover:shadow-lg hover:border-gray-300 hover:-translate-y-1",
          "transition-all duration-300 ease-out"
        )}
      >
        {/* Превью - сверху на desktop */}
        <div className={cn(
          "w-full h-32 bg-gradient-to-br flex items-center justify-center relative",
          gradient
        )}>
          {leadMagnet.type === 'link' && leadMagnet.fileUrl ? (
            <Image
              src={leadMagnet.fileUrl}
              alt={leadMagnet.title}
              fill
              className="object-cover"
            />
          ) : (
            <FileIcon className="w-12 h-12 text-white" />
          )}
        </div>

        {/* Контент - снизу на desktop */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-gray-700">
            {leadMagnet.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">
            {metaText}
          </p>
          {leadMagnet.targetAudience && (
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
              audienceBadgeColor
            )}>
              {leadMagnet.targetAudience}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
