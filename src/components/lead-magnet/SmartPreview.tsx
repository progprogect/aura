'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getLeadMagnetPreviewData, getLeadMagnetBadgeColor } from '@/lib/lead-magnets/preview'
import { ServicePreview } from './ServicePreview'
import type { LeadMagnet } from '@/types/lead-magnet'

interface SmartPreviewProps {
  leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'ogImage' | 'fileSize' | 'emoji' | 'title' | 'description' | 'highlights'>
  className?: string
}

// Компонент для встраивания видео (YouTube, Vimeo, etc.)
function VideoEmbed({ url }: { url: string }) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Простая логика определения типа видео по URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}`
    }
    return null
  }

  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-4xl mb-2">🎥</div>
          <p className="text-sm text-gray-600">Видео недоступно для предпросмотра</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  )
}

// Компонент для PDF preview
function PDFPreview({ url, title }: { url: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-gray-600 mb-2">PDF документ</p>
            <p className="text-xs text-gray-500">
              Нажмите кнопку &quot;Скачать файл&quot; для просмотра
            </p>
          </div>
        </div>
      ) : (
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
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


export function SmartPreview({ leadMagnet, className }: SmartPreviewProps) {
  const previewData = getLeadMagnetPreviewData(leadMagnet)

  // Определяем правильный aspect-ratio для превью
  const getAspectRatio = () => {
    // Для видео - всегда 16:9
    if (leadMagnet.type === 'link' && leadMagnet.linkUrl) {
      if (leadMagnet.linkUrl.includes('youtube.com') || 
          leadMagnet.linkUrl.includes('youtu.be') || 
          leadMagnet.linkUrl.includes('vimeo.com')) {
        return 'aspect-video'
      }
    }

    // Для файлов - определяем по типу
    if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
      const url = leadMagnet.fileUrl.toLowerCase()
      if (url.includes('.pdf')) {
        return 'aspect-[3/4]' // PDF - вертикальный документ
      }
      if (url.includes('.doc') || url.includes('.docx') || 
          url.includes('.xls') || url.includes('.xlsx') ||
          url.includes('.ppt') || url.includes('.pptx')) {
        return 'aspect-[4/3]' // Office документы - горизонтальные
      }
    }

    // Для сервисов и остальных - универсальный формат
    return 'aspect-[4/3]'
  }

  // Логика определения типа превью
  const getPreviewContent = () => {
    // Для ссылок - пытаемся встроить видео
    if (leadMagnet.type === 'link' && leadMagnet.linkUrl) {
      if (leadMagnet.linkUrl.includes('youtube.com') || 
          leadMagnet.linkUrl.includes('youtu.be') || 
          leadMagnet.linkUrl.includes('vimeo.com')) {
        return <VideoEmbed url={leadMagnet.linkUrl} />
      }
      
      // Для других ссылок - используем OG image
      if (leadMagnet.ogImage) {
        return (
          <div className="w-full h-full relative">
            <Image
              src={leadMagnet.ogImage}
              alt={leadMagnet.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )
      }
    }

    // Для файлов - пытаемся показать PDF preview
    if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
      if (leadMagnet.fileUrl.toLowerCase().includes('.pdf')) {
        return <PDFPreview url={leadMagnet.fileUrl} title={leadMagnet.title} />
      }
    }

    // Для сервисов - показываем информационное превью
    if (leadMagnet.type === 'service') {
      return <ServicePreview leadMagnet={leadMagnet} />
    }

    // Fallback - используем градиент с иконкой
    return (
      <div className="w-full h-full relative overflow-hidden rounded-lg">
        <div className={cn("absolute inset-0", previewData.gradient)} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">{previewData.icon}</div>
            <div className="text-lg font-medium">{previewData.typeLabel}</div>
          </div>
        </div>
      </div>
    )
  }

  const aspectRatio = getAspectRatio()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={cn(
        "w-full",
        aspectRatio,
        className
      )}
    >
      {getPreviewContent()}
    </motion.div>
  )
}
