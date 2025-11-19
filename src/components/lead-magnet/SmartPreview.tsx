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
  leadMagnet: Pick<LeadMagnet, 'id' | 'type' | 'fileUrl' | 'linkUrl' | 'ogImage' | 'emoji' | 'title' | 'description' | 'highlights' | 'previewUrls' | 'priceInPoints'>
  specialistId?: string
  specialistName?: string
  hasPurchased?: boolean
  className?: string
}

export function SmartPreview({ leadMagnet, specialistId, specialistName, hasPurchased = false, className }: SmartPreviewProps) {
  
  // ПРИОРИТЕТ 1: Для сервисов - показываем форму только после покупки или если бесплатный
  if (leadMagnet.type === 'service') {
    const isPaid = typeof leadMagnet.priceInPoints === 'number' && leadMagnet.priceInPoints > 0
    const isFree = !isPaid
    
    // Если куплено или бесплатный - показываем форму
    if (hasPurchased || isFree) {
      return (
        <ServicePreview 
          leadMagnet={leadMagnet}
          specialistId={specialistId}
          specialistName={specialistName}
          className={className}
        />
      )
    }
    
    // Если платный и не куплено - показываем placeholder с призывом к покупке
    const gradient = getFallbackGradient('service')
    return (
      <div 
        className={`w-full aspect-square relative overflow-hidden rounded-lg flex flex-col items-center justify-center ${className || ''}`}
        style={{ background: gradient }}
      >
        <div className="text-center px-6">
          <div 
            className="text-9xl drop-shadow-lg mb-4"
            style={{ 
              filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))',
              color: 'rgba(255, 255, 255, 0.95)'
            }}
          >
            {leadMagnet.emoji || '🎁'}
          </div>
          <p className="text-white text-lg font-semibold drop-shadow-lg">
            Купите для доступа к форме записи
          </p>
        </div>
      </div>
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
