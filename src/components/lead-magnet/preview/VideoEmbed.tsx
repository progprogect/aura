/**
 * Компонент для встраивания видео (YouTube, Vimeo, etc.)
 */

'use client'

import { useState } from 'react'

interface VideoEmbedProps {
  url: string
  platform?: string
}

export function VideoEmbed({ url, platform }: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
      <iframe
        src={url}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoaded(true)}
        className="w-full h-full"
        title={`Video: ${platform || 'Embedded'}`}
      />
    </div>
  )
}

