/**
 * Preview блок для лид-магнита (файл или ссылка с OG image)
 */

'use client'

import Image from 'next/image'
import { getPreviewData } from '@/lib/lead-magnets/utils'
import type { LeadMagnet } from '@/types/lead-magnet'

interface PreviewBlockProps {
  leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'ogImage' | 'fileSize'>
}

export function PreviewBlock({ leadMagnet }: PreviewBlockProps) {
  const previewData = getPreviewData(leadMagnet)

  if (!previewData) return null

  if (previewData.type === 'file') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center flex-col gap-3 mb-6">
        <div className="text-5xl">{previewData.icon}</div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700 mb-1">
            {previewData.fileName}
          </div>
          {previewData.fileSize && (
            <div className="text-xs text-gray-500">
              {previewData.fileSize}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (previewData.type === 'link') {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6 border border-gray-200">
        <Image
          src={previewData.imageUrl}
          alt="Preview"
          fill
          className="object-cover"
        />
      </div>
    )
  }

  return null
}

