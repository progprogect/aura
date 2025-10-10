/**
 * Специализированный компонент превью для карточек лид-магнитов
 * Оптимизирован для размера карточки с lazy loading
 * Поддерживает режим 'responsive' для адаптивных вертикальных карточек
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeadMagnetUI } from '@/types/lead-magnet'
import { 
  getPreviewGradient, 
  getFileIcon, 
  getFileExtension,
  isYouTubeUrl,
  getYouTubeThumbnail
} from '@/lib/lead-magnets/preview'

interface CardPreviewProps {
  leadMagnet: LeadMagnetUI
  className?: string
  size?: 'mobile' | 'desktop' | 'responsive'
}

export function CardPreview({ leadMagnet, className, size = 'desktop' }: CardPreviewProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fileExtension = getFileExtension(leadMagnet.fileUrl)
  const gradient = getPreviewGradient(leadMagnet.type, fileExtension)
  const FileIcon = getFileIcon(fileExtension)

  // Проверяем наличие responsive превью (новая система)
  const hasResponsivePreview = !!leadMagnet.previewUrls && !imageError
  
  // Проверяем наличие старого превью (обратная совместимость)
  const hasPreviewImage = !!leadMagnet.previewImage && !imageError
  
  // Проверяем YouTube
  const isYouTube = leadMagnet.type === 'link' && leadMagnet.linkUrl && isYouTubeUrl(leadMagnet.linkUrl)
  const youtubeThumbnail = isYouTube && leadMagnet.linkUrl ? getYouTubeThumbnail(leadMagnet.linkUrl) : null
  
  // Проверяем OG image
  const hasOgImage = !!leadMagnet.ogImage && !imageError
  
  // Определяем источник изображения (приоритет: previewUrls > previewImage > YouTube > OG)
  const imageSource = hasResponsivePreview
    ? leadMagnet.previewUrls!.card  // Используем card размер для карточек
    : hasPreviewImage 
    ? leadMagnet.previewImage 
    : youtubeThumbnail 
    ? youtubeThumbnail 
    : hasOgImage 
    ? leadMagnet.ogImage 
    : null
  
  // srcSet для responsive images (если есть previewUrls)
  const srcSet = hasResponsivePreview 
    ? `${leadMagnet.previewUrls!.thumbnail} 400w, ${leadMagnet.previewUrls!.card} 800w`
    : undefined
  
  // sizes для браузера
  const sizes = hasResponsivePreview
    ? size === 'mobile' ? '80px' : size === 'responsive' ? '(max-width: 640px) 100vw, 400px' : '400px'
    : undefined

  // Размеры в зависимости от размера карточки
  const dimensions = size === 'mobile' 
    ? { width: 'w-20', height: 'h-20' }
    : size === 'responsive'
    ? { width: 'w-full', height: 'h-32 sm:h-36 md:h-40' }
    : { width: 'w-full', height: 'h-40' }

  // Если есть изображение - показываем его
  if (imageSource) {
    return (
      <div className={cn(
        'relative overflow-hidden',
        dimensions.width,
        dimensions.height,
        className
      )}>
        {/* Скелетон загрузки */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Изображение (Next.js автоматически оптимизирует) */}
        <Image
          src={imageSource}
          alt={leadMagnet.title}
          fill
          className={cn(
            'object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true)
            setIsLoading(false)
          }}
          sizes={sizes || "(max-width: 768px) 80px, 400px"}
        />

        {/* Play button для YouTube */}
        {isYouTube && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="bg-red-600 rounded-full p-2 sm:p-3 md:p-4 group-hover:scale-110 transition-transform">
              <Play className={cn(
                'text-white fill-white',
                size === 'mobile' ? 'w-4 h-4' : size === 'responsive' ? 'w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8' : 'w-6 h-6 md:w-8 md:h-8'
              )} />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Fallback для PDF
  const isPDF = leadMagnet.type === 'file' && leadMagnet.fileUrl?.toLowerCase().includes('.pdf')
  if (isPDF) {
    return (
      <div className={cn(
        'bg-gray-50 flex items-center justify-center',
        dimensions.width,
        dimensions.height,
        className
      )}>
        <div className="text-center">
          <FileIcon className={cn(
            'text-gray-600 mx-auto mb-1',
            size === 'mobile' ? 'w-6 h-6' : size === 'responsive' ? 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-12 md:h-12'
          )} />
          <div className={cn(
            'text-gray-500 font-medium',
            size === 'mobile' ? 'text-xs' : 'text-xs sm:text-sm'
          )}>PDF</div>
        </div>
      </div>
    )
  }

  // Fallback для сервисов
  const isService = leadMagnet.type === 'service'
  if (isService) {
    return (
      <div className={cn(
        'bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center',
        dimensions.width,
        dimensions.height,
        className
      )}>
        <div className="text-center text-white">
          <div className={cn(
            'mb-1',
            size === 'mobile' ? 'text-xl' : size === 'responsive' ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-2xl md:text-4xl'
          )}>{leadMagnet.emoji || '💼'}</div>
          <div className={cn(
            'font-medium',
            size === 'mobile' ? 'text-xs' : 'text-xs sm:text-sm'
          )}>Услуга</div>
        </div>
      </div>
    )
  }

  // Универсальный fallback с градиентом
  return (
    <div className={cn(
      'bg-gradient-to-br flex items-center justify-center',
      gradient,
      dimensions.width,
      dimensions.height,
      className
    )}>
      {leadMagnet.emoji ? (
        <div className={cn(
          size === 'mobile' ? 'text-2xl' : size === 'responsive' ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-3xl md:text-5xl'
        )}>{leadMagnet.emoji}</div>
      ) : (
        <FileIcon className={cn(
          'text-white',
          size === 'mobile' ? 'w-6 h-6' : size === 'responsive' ? 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-12 md:h-12'
        )} />
      )}
    </div>
  )
}

