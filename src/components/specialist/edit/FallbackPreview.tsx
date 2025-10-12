/**
 * FallbackPreview - показывает стандартное fallback превью
 * Использует статический SVG файл вместо генерации
 */

'use client'

import { FALLBACK_PREVIEW_URL } from '@/lib/lead-magnets/constants'
import Image from 'next/image'

interface FallbackPreviewProps {
  className?: string
}

export function FallbackPreview({ className = '' }: FallbackPreviewProps) {
  return (
    <div className={`relative w-full aspect-square rounded-lg overflow-hidden ${className}`}>
      <Image
        src={FALLBACK_PREVIEW_URL}
        alt="Стандартное превью"
        fill
        className="object-cover"
        priority
      />
    </div>
  )
}

