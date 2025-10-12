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
      {/* Hero-превью с улучшенным дизайном */}
      <div className={cn(
        "relative w-full h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden",
        "bg-gradient-to-br flex items-center justify-center",
        gradient
      )}>
        {/* Декоративные фоновые элементы */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24" />
          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-white rounded-full" />
        </div>

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

        {/* Для файлов - улучшенная карточка */}
        {leadMagnet.type === 'file' && (
          <div className="text-center z-10">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 md:p-8">
              {leadMagnet.emoji ? (
                <div className="text-6xl md:text-7xl mb-4 drop-shadow-lg">
                  {leadMagnet.emoji}
                </div>
              ) : (
                <FileIcon className="w-20 h-20 md:w-24 md:h-24 text-white mb-4 mx-auto drop-shadow-lg" />
              )}
              <div className="text-white text-xl md:text-2xl font-semibold drop-shadow">
                {fileType}
              </div>
              {!leadMagnet.emoji && fileExtension && (
                <div className="text-white/80 text-sm md:text-base mt-2">
                  {fileExtension.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Для сервисов - улучшенная карточка */}
        {leadMagnet.type === 'service' && (
          <div className="text-center z-10">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 md:p-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/30 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-4xl md:text-5xl">{leadMagnet.emoji || '💼'}</span>
              </div>
              <div className="text-white text-xl md:text-2xl font-semibold drop-shadow">
                Услуга
              </div>
              {leadMagnet.description && (
                <div className="text-white/80 text-sm md:text-base mt-2 max-w-sm">
                  {leadMagnet.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Для ссылок без изображения - улучшенная карточка */}
        {leadMagnet.type === 'link' && !leadMagnet.fileUrl && (
          <div className="text-center z-10">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 md:p-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/30 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-4xl md:text-5xl">{leadMagnet.emoji || '🔗'}</span>
              </div>
              <div className="text-white text-xl md:text-2xl font-semibold drop-shadow">
                Внешняя ссылка
              </div>
            </div>
          </div>
        )}

        {/* Тонкий градиент для глубины */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
