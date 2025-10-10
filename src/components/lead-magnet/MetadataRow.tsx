/**
 * Строка с метаданными лид-магнита (аудитория, счетчик, размер)
 */

'use client'

import { shouldShowSocialProof, formatDownloadCount } from '@/lib/lead-magnets/utils'

interface MetadataRowProps {
  targetAudience?: string | null
  downloadCount: number
  fileSize?: string | null
  type: string
}

export function MetadataRow({ 
  targetAudience, 
  downloadCount, 
  fileSize,
  type 
}: MetadataRowProps) {
  const showSocialProof = shouldShowSocialProof(downloadCount)
  const hasAnyMetadata = targetAudience || showSocialProof || (type === 'file' && fileSize)

  if (!hasAnyMetadata) return null

  return (
    <div className="flex items-center gap-3 text-xs text-gray-600 mb-6 flex-wrap">
      {targetAudience && (
        <div className="flex items-center gap-1">
          <span>📊</span>
          <span>{targetAudience}</span>
        </div>
      )}
      
      {showSocialProof && (
        <div className="flex items-center gap-1">
          <span>⬇️</span>
          <span>Скачали {formatDownloadCount(downloadCount)} раз</span>
        </div>
      )}
      
      {type === 'file' && fileSize && (
        <div className="flex items-center gap-1">
          <span>📄</span>
          <span>{fileSize}</span>
        </div>
      )}
    </div>
  )
}

