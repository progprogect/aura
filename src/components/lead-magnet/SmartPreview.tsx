'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getLeadMagnetPreviewData, getLeadMagnetBadgeColor } from '@/lib/lead-magnets/preview'
import { generateLinkPreview, generateFilePreview, getAspectRatio } from '@/lib/lead-magnets/preview-generator'
import { ServicePreview } from './ServicePreview'
import type { LeadMagnet } from '@/types/lead-magnet'

interface SmartPreviewProps {
  leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'ogImage' | 'fileSize' | 'emoji' | 'title' | 'description' | 'highlights'>
  className?: string
}

// Компонент для встраивания видео (YouTube, Vimeo, etc.)
function VideoEmbed({ url, platform }: { url: string; platform?: string }) {
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

// Компонент для встраивания документов
function DocumentEmbed({ url, platform }: { url: string; platform?: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
      
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-gray-600 mb-2">Документ</p>
            <p className="text-xs text-gray-500">
              Нажмите кнопку &quot;Перейти по ссылке&quot; для просмотра
            </p>
          </div>
        </div>
      ) : (
        <iframe
          src={url}
          className="w-full h-full"
          title={`Preview: ${platform || 'Document'}`}
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

// Компонент для встраивания аудио
function AudioEmbed({ url, platform }: { url: string; platform?: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      )}
      
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">🎵</div>
            <p className="text-sm text-gray-600 mb-2">Аудио</p>
            <p className="text-xs text-gray-500">
              Нажмите кнопку &quot;Перейти по ссылке&quot; для прослушивания
            </p>
          </div>
        </div>
      ) : (
        <iframe
          src={url}
          className="w-full h-full"
          title={`Preview: ${platform || 'Audio'}`}
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

// Компонент для встраивания социальных постов
function SocialEmbed({ url, platform }: { url: string; platform?: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
        </div>
      )}
      
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">📱</div>
            <p className="text-sm text-gray-600 mb-2">Социальный пост</p>
            <p className="text-xs text-gray-500">
              Нажмите кнопку &quot;Перейти по ссылке&quot; для просмотра
            </p>
          </div>
        </div>
      ) : (
        <iframe
          src={url}
          className="w-full h-full"
          title={`Preview: ${platform || 'Social Post'}`}
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

// Компонент для видео файлов
function VideoFilePreview({ url, title }: { url: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      )}
      
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-sm text-gray-600 mb-2">Видео файл</p>
            <p className="text-xs text-gray-500">
              Нажмите кнопку &quot;Скачать файл&quot; для просмотра
            </p>
          </div>
        </div>
      ) : (
        <video
          src={url}
          className="w-full h-full object-cover"
          controls={false}
          preload="metadata"
          onLoadedMetadata={() => setIsLoaded(true)}
          onError={() => {
            setIsLoaded(true)
            setHasError(true)
          }}
        />
      )}
    </div>
  )
}

// Компонент для аудио файлов
function AudioFilePreview({ url, title }: { url: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg overflow-hidden flex items-center justify-center">
      {!isLoaded && !hasError && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      )}
      
      {hasError ? (
        <div className="text-center text-white p-6">
          <div className="text-4xl mb-2">🎵</div>
          <p className="text-sm mb-2">Аудио файл</p>
          <p className="text-xs opacity-75">
            Нажмите кнопку &quot;Скачать файл&quot; для прослушивания
          </p>
        </div>
      ) : (
        <div className="text-center text-white">
          <div className="text-5xl mb-3">🎵</div>
          <p className="text-lg font-medium mb-2">Аудио</p>
          <audio
            src={url}
            controls
            className="w-full max-w-xs"
            onLoadedMetadata={() => setIsLoaded(true)}
            onError={() => {
              setIsLoaded(true)
              setHasError(true)
            }}
          />
        </div>
      )}
    </div>
  )
}

// Компонент для других документов
function DocumentPreview({ url, title, type }: { url: string; title: string; type: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
      
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-gray-600 mb-2">{type === 'presentation' ? 'Презентация' : type === 'spreadsheet' ? 'Таблица' : 'Документ'}</p>
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
  const getPreviewAspectRatio = () => {
    // Для ссылок
    if (leadMagnet.type === 'link' && leadMagnet.linkUrl) {
      const linkPreview = generateLinkPreview(leadMagnet.linkUrl, leadMagnet.ogImage || undefined)
      return getAspectRatio(linkPreview.type, linkPreview.platform)
    }

    // Для файлов
    if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
      const filePreview = generateFilePreview(leadMagnet.fileUrl, leadMagnet.fileUrl.split('/').pop())
      return getAspectRatio(filePreview.type, filePreview.platform)
    }

    // Для сервисов и остальных - универсальный формат
    return 'aspect-[4/3]'
  }

  // Логика определения типа превью
  const getPreviewContent = () => {
    // Для ссылок - умное определение типа контента
    if (leadMagnet.type === 'link' && leadMagnet.linkUrl) {
      const linkPreview = generateLinkPreview(leadMagnet.linkUrl, leadMagnet.ogImage || undefined)
      
      // Видео контент
      if (linkPreview.type === 'video' && linkPreview.embedUrl) {
        return <VideoEmbed url={linkPreview.embedUrl} platform={linkPreview.platform} />
      }
      
      // Документы (Google Docs, Office, etc.)
      if (linkPreview.type === 'document' && linkPreview.embedUrl) {
        return <DocumentEmbed url={linkPreview.embedUrl} platform={linkPreview.platform} />
      }
      
      // Аудио контент
      if (linkPreview.type === 'audio' && linkPreview.embedUrl) {
        return <AudioEmbed url={linkPreview.embedUrl} platform={linkPreview.platform} />
      }
      
      // Социальные платформы
      if (linkPreview.type === 'social' && linkPreview.embedUrl) {
        return <SocialEmbed url={linkPreview.embedUrl} platform={linkPreview.platform} />
      }
      
      // Изображения
      if (linkPreview.type === 'image' && linkPreview.thumbnailUrl) {
        return (
          <div className="w-full h-full relative">
            <Image
              src={linkPreview.thumbnailUrl}
              alt={leadMagnet.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )
      }
      
      // Обычные ссылки с OG image
      if (linkPreview.thumbnailUrl) {
        return (
          <div className="w-full h-full relative">
            <Image
              src={linkPreview.thumbnailUrl}
              alt={leadMagnet.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )
      }
    }

    // Для файлов - умное определение типа
    if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
      const filePreview = generateFilePreview(leadMagnet.fileUrl, leadMagnet.fileUrl.split('/').pop())
      
      // PDF файлы
      if (filePreview.type === 'document' && leadMagnet.fileUrl.toLowerCase().includes('.pdf')) {
        return <PDFPreview url={leadMagnet.fileUrl} title={leadMagnet.title} />
      }
      
      // Изображения
      if (filePreview.type === 'image') {
        return (
          <div className="w-full h-full relative">
            <Image
              src={leadMagnet.fileUrl}
              alt={leadMagnet.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )
      }
      
      // Видео файлы
      if (filePreview.type === 'video') {
        return <VideoFilePreview url={leadMagnet.fileUrl} title={leadMagnet.title} />
      }
      
      // Аудио файлы
      if (filePreview.type === 'audio') {
        return <AudioFilePreview url={leadMagnet.fileUrl} title={leadMagnet.title} />
      }
      
      // Другие документы
      if (filePreview.isEmbeddable) {
        return <DocumentPreview url={leadMagnet.fileUrl} title={leadMagnet.title} type={filePreview.type} />
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

  const aspectRatio = getPreviewAspectRatio()

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
