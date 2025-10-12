/**
 * FallbackPreview - показывает как будет выглядеть fallback превью
 * CSS версия для preview (без генерации через Canvas)
 */

'use client'

import { getFallbackGradient } from '@/lib/lead-magnets/preview-utils'
import type { LeadMagnetType } from '@/types/lead-magnet'

interface FallbackPreviewProps {
  type: LeadMagnetType
  emoji: string
  className?: string
}

export function FallbackPreview({ type, emoji, className = '' }: FallbackPreviewProps) {
  const gradient = getFallbackGradient(type)

  return (
    <div 
      className={`relative w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: gradient }}
    >
      {/* Emoji */}
      <div className="flex items-center justify-center w-full h-full">
        <div 
          className="text-8xl sm:text-9xl"
          style={{ 
            filter: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.15))',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: 1,
            transform: 'translateY(-2px)' // Микро-корректировка для визуального центрирования
          }}
        >
          {emoji}
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <div className="text-xs text-white/60 font-medium">
          Автоматическое превью
        </div>
      </div>
    </div>
  )
}

