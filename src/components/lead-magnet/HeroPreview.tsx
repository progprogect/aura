/**
 * Hero-превью для детальной страницы лид-магнита
 * Всегда отображается с fallback, крупное и визуально привлекательное
 */

'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { LeadMagnet } from '@/types/lead-magnet'
import { 
  getPreviewGradient, 
  getFileIcon, 
  getFileExtension,
  getFileType
} from '@/lib/lead-magnets/preview'

interface HeroPreviewProps {
  leadMagnet: LeadMagnet
}

export function HeroPreview({ leadMagnet }: HeroPreviewProps) {
  const fileExtension = getFileExtension(leadMagnet.fileUrl)
  const gradient = getPreviewGradient(leadMagnet.type, fileExtension)
  const FileIcon = getFileIcon(fileExtension)
  const fileType = getFileType(fileExtension)

  return (
    <div className="w-full">
      {/* Hero-превью */}
      <div className={cn(
        "relative w-full h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden",
        "bg-gradient-to-br flex items-center justify-center",
        gradient
      )}>
        {/* Для ссылок с изображением */}
        {leadMagnet.type === 'link' && leadMagnet.fileUrl && (
          <Image
            src={leadMagnet.fileUrl}
            alt={leadMagnet.title}
            fill
            className="object-cover"
            priority
          />
        )}

        {/* Для файлов - крупная иконка */}
        {leadMagnet.type === 'file' && (
          <div className="text-center">
            <FileIcon className="w-16 h-16 md:w-20 md:h-20 text-white mb-3 mx-auto" />
            <div className="text-white text-lg font-medium">
              {fileType}
            </div>
          </div>
        )}

        {/* Для сервисов - иконка + описание */}
        {leadMagnet.type === 'service' && (
          <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-3 mx-auto">
              <span className="text-2xl md:text-3xl">{leadMagnet.emoji}</span>
            </div>
            <div className="text-white text-lg font-medium">
              Услуга
            </div>
          </div>
        )}

        {/* Для ссылок без изображения */}
        {leadMagnet.type === 'link' && !leadMagnet.fileUrl && (
          <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-3 mx-auto">
              <span className="text-2xl md:text-3xl">{leadMagnet.emoji}</span>
            </div>
            <div className="text-white text-lg font-medium">
              Внешняя ссылка
            </div>
          </div>
        )}

        {/* Декоративные элементы */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </div>
  )
}
