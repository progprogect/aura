/**
 * Responsive Preview компонент
 * Использует srcset для оптимальной загрузки изображений на разных устройствах
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { PreviewUrls } from '@/types/lead-magnet'
import { generateSrcSet, generateSizes } from '@/lib/lead-magnets/preview/utils/helpers'

interface ResponsivePreviewProps {
  urls: PreviewUrls
  alt: string
  type?: 'card' | 'detail'
  className?: string
  priority?: boolean
}

export function ResponsivePreview({
  urls,
  alt,
  type = 'card',
  className,
  priority = false
}: ResponsivePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Используем соответствующий URL в зависимости от типа
  const src = type === 'detail' ? urls.detail : urls.card
  
  // Генерируем srcSet для responsive images
  const srcSet = generateSrcSet(urls)
  
  // Генерируем sizes для браузера
  const sizes = generateSizes(type)

  if (hasError) {
    return (
      <div className={cn(
        'w-full h-full bg-gray-100 flex items-center justify-center',
        className
      )}>
        <div className="text-gray-400 text-sm">Не удалось загрузить изображение</div>
      </div>
    )
  }

  return (
    <div className={cn(
      'relative overflow-hidden',
      className
    )}>
      {/* Скелетон загрузки */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Responsive изображение (Next.js автоматически оптимизирует) */}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        sizes={sizes}
        priority={priority}
      />
    </div>
  )
}

