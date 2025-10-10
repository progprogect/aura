/**
 * Компонент для PDF preview с первой страницей (серверное)
 */

'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PDFPreviewProps {
  url: string
  title: string
  previewImage?: string | null
  className?: string
}

export function PDFPreview({ url, title, previewImage, className }: PDFPreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Если есть сгенерированное превью - используем его
  if (previewImage) {
    return (
      <div className={cn("w-full h-full relative bg-gray-100 rounded-lg overflow-hidden", className)}>
        <Image
          src={previewImage}
          alt={`Preview: ${title}`}
          fill
          className="object-contain"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true)
            setIsLoaded(true)
          }}
        />
      </div>
    )
  }

  // Fallback с градиентом и иконкой
  return (
    <div className={cn("w-full h-full relative bg-gray-100 rounded-lg overflow-hidden", className)}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-orange-600">
          <div className="text-center text-white p-6">
            <div className="text-6xl mb-4">📄</div>
            <div className="text-lg font-medium">PDF документ</div>
            <p className="text-sm opacity-90 mt-2">
              Нажмите кнопку &quot;Скачать файл&quot; для просмотра
            </p>
          </div>
        </div>
      ) : (
        <iframe
          src={`${url}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=FitH`}
          className="w-full h-full"
          title={`Preview: ${title}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setIsLoaded(true)
            setHasError(true)
          }}
        />
      )}
    </div>
  )
}

