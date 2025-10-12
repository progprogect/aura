/**
 * SmartPreview - умное отображение превью лид-магнита
 * Упрощённая версия 2.0 с использованием previewUrls
 */

'use client'

import React from 'react'
import Image from 'next/image'
import { ServicePreview } from './ServicePreview'
import { getFallbackGradient } from '@/lib/lead-magnets/preview-utils'
import { parsePreviewUrls } from '@/lib/lead-magnets/preview/utils/parse-preview-urls'
import type { LeadMagnet } from '@/types/lead-magnet'

interface SmartPreviewProps {
  leadMagnet: Pick<LeadMagnet, 'id' | 'type' | 'fileUrl' | 'linkUrl' | 'ogImage' | 'emoji' | 'title' | 'description' | 'highlights' | 'previewUrls'>
  specialistId?: string
  specialistName?: string
  className?: string
}

export function SmartPreview({ leadMagnet, specialistId, specialistName, className }: SmartPreviewProps) {
  
  // ПРИОРИТЕТ 1: Для сервисов - ВСЕГДА показываем форму заявки (не картинку!)
  if (leadMagnet.type === 'service') {
    return (
      <ServicePreview 
        leadMagnet={leadMagnet}
        specialistId={specialistId}
        specialistName={specialistName}
      />
    )
  }

  // Безопасный парсинг previewUrls
  const previewUrls = parsePreviewUrls(leadMagnet.previewUrls)

  // ПРИОРИТЕТ 2: Если есть previewUrls - используем их
  if (previewUrls) {
    return (
      <div className={`w-full aspect-square relative overflow-hidden rounded-lg ${className || ''}`}>
        <Image
          src={previewUrls.detail}
          alt={leadMagnet.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
        />
      </div>
    )
  }

  // FALLBACK: Градиент с emoji
  const gradient = getFallbackGradient(leadMagnet.type)

  return (
    <div 
      className={`w-full aspect-square relative overflow-hidden rounded-lg flex items-center justify-center ${className || ''}`}
      style={{ background: gradient }}
    >
      <div className="text-center">
        <div 
          className="text-9xl drop-shadow-lg"
          style={{ 
            filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))',
            color: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          {leadMagnet.emoji || '🎁'}
        </div>
      </div>
    </div>
  )
}
