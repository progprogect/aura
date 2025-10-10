'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getLeadMagnetPreviewData, getLeadMagnetBadgeColor } from '@/lib/lead-magnets/preview'
import { generateLinkPreview, generateFilePreview, getAspectRatio, getPreviewStyles } from '@/lib/lead-magnets/preview-generator'
import { generatePDFPreview, isPDFPreviewSupported, getPDFFallbackPreview } from '@/lib/pdf-preview'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { ServicePreview } from './ServicePreview'
import type { LeadMagnet } from '@/types/lead-magnet'

interface SmartPreviewProps {
  leadMagnet: Pick<LeadMagnet, 'id' | 'type' | 'fileUrl' | 'linkUrl' | 'ogImage' | 'fileSize' | 'emoji' | 'title' | 'description' | 'highlights' | 'previewImage'>
  specialistId?: string
  specialistName?: string
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

// Компонент для PDF preview с первой страницей
function PDFPreview({ url, title }: { url: string; title: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Генерируем превью при монтировании
  React.useEffect(() => {
    const generatePreview = async () => {
      try {
        if (!isPDFPreviewSupported()) {
          // Если PDF.js не поддерживается, используем iframe
          setIsLoaded(true)
          return
        }

        const preview = await generatePDFPreview(url)
        if (preview) {
          setPreviewImage(preview)
        }
        setIsLoaded(true)
      } catch (error) {
        console.error('Ошибка генерации PDF превью:', error)
        setHasError(true)
        setIsLoaded(true)
      }
    }

    generatePreview()
  }, [url])

  // Если есть превью изображение, показываем его
  if (previewImage) {
    return (
      <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
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
  const fallback = getPDFFallbackPreview()

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {hasError ? (
        <div className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br", fallback.gradient)}>
          <div className="text-center text-white p-6">
            <div className="text-6xl mb-4">{fallback.icon}</div>
            <div className="text-lg font-medium">{fallback.typeLabel}</div>
            <p className="text-sm opacity-90 mt-2">
              Нажмите кнопку &quot;Скачать файл&quot; для просмотра
            </p>
          </div>
        </div>
      ) : !previewImage ? (
        // Если нет превью, но PDF.js поддерживается, показываем iframe
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
      ) : null}
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

// Компонент формы заявки на услугу (компактная форма)
function ServiceRequestForm({ 
  leadMagnet, 
  specialistId, 
  specialistName,
  onOpenModal 
}: { 
  leadMagnet: Pick<LeadMagnet, 'id' | 'title' | 'description' | 'emoji' | 'highlights'>
  specialistId?: string
  specialistName?: string
  onOpenModal: () => void 
}) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !contact.trim()) {
      alert('Заполните имя и контакт')
      return
    }

    if (!specialistId) {
      alert('Ошибка: не указан специалист')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/consultation-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistId,
          leadMagnetId: leadMagnet.id,
          name: name.trim(),
          contact: contact.trim(),
          message: message.trim() || `Заявка на: ${leadMagnet.title}`,
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          setIsSuccess(false)
          setName('')
          setContact('')
          setMessage('')
        }, 3000)
      } else {
        alert('Ошибка отправки заявки')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка отправки заявки')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-100 border border-green-300 rounded-lg p-4 text-center"
        >
          <div className="text-3xl mb-2">✅</div>
          <p className="text-green-800 font-medium">Заявка отправлена!</p>
          <p className="text-sm text-green-700 mt-1">
            {specialistName} свяжется с вами в ближайшее время
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Имя */}
          <div>
            <label
              htmlFor="service-name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Ваше имя *
            </label>
            <input
              type="text"
              id="service-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={cn(
                'w-full rounded-lg border border-gray-300 px-4 py-2.5',
                'text-gray-900 placeholder-gray-400',
                'transition-colors',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'
              )}
              placeholder="Как к вам обращаться?"
            />
          </div>

          {/* Контакт */}
          <div>
            <label
              htmlFor="service-contact"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Телефон или Telegram *
            </label>
            <input
              type="text"
              id="service-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className={cn(
                'w-full rounded-lg border border-gray-300 px-4 py-2.5',
                'text-gray-900 placeholder-gray-400',
                'transition-colors',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20'
              )}
              placeholder="+7 (999) 123-45-67 или @username"
            />
          </div>

          {/* Сообщение */}
          <div>
            <label
              htmlFor="service-message"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Сообщение (необязательно)
            </label>
            <textarea
              id="service-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className={cn(
                'w-full rounded-lg border border-gray-300 px-4 py-2.5',
                'text-gray-900 placeholder-gray-400',
                'transition-colors',
                'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                'resize-none'
              )}
              placeholder="Расскажите кратко о вашем запросе..."
            />
          </div>

          {/* Кнопка отправки */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              'Отправить заявку'
            )}
          </Button>
        </form>
      )}
    </div>
  )
}

export function SmartPreview({ leadMagnet, specialistId, specialistName, className }: SmartPreviewProps) {
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

    // Для сервисов - высота определяется контентом формы
    if (leadMagnet.type === 'service') {
      return '' // Естественный размер по контенту
    }

    // Для остальных - универсальный формат
    return 'aspect-[4/3]'
  }

  // Получаем динамические стили для превью
  const getDynamicPreviewStyles = () => {
    if (leadMagnet.type === 'link' && leadMagnet.linkUrl) {
      const linkPreview = generateLinkPreview(leadMagnet.linkUrl, leadMagnet.ogImage || undefined)
      return getPreviewStyles(linkPreview.type, linkPreview.platform)
    }

    if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
      const filePreview = generateFilePreview(leadMagnet.fileUrl, leadMagnet.fileUrl.split('/').pop())
      return getPreviewStyles(filePreview.type, filePreview.platform)
    }

    // Для сервисов - естественный размер по контенту
    if (leadMagnet.type === 'service') {
      return {} // Естественный размер по контенту
    }

    return { aspectRatio: '4/3', objectFit: 'cover' }
  }

  // Логика определения типа превью
  const getPreviewContent = () => {
    // ПРИОРИТЕТ 1: Для сервисов - ВСЕГДА показываем форму заявки (не картинку!)
    if (leadMagnet.type === 'service') {
      return (
        <ServiceRequestForm 
          leadMagnet={leadMagnet} 
          specialistId={specialistId}
          specialistName={specialistName}
          onOpenModal={() => {}} 
        />
      )
    }

    // ПРИОРИТЕТ 2: Если есть сгенерированное превью - используем его
    if (leadMagnet.previewImage) {
      return (
        <div className="w-full h-full relative">
          <Image
            src={leadMagnet.previewImage}
            alt={leadMagnet.title}
            fill
            className="object-contain rounded-lg"
            priority
          />
        </div>
      )
    }

    // ПРИОРИТЕТ 3: Для ссылок - умное определение типа контента с embed
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
      
      // PDF файлы - используем extension из filePreview для надежного определения
      if (filePreview.type === 'document' && filePreview.extension === '.pdf') {
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

    // Улучшенный fallback с информативной карточкой
    return (
      <div className="w-full h-full relative overflow-hidden rounded-lg">
        <div className={cn("absolute inset-0 bg-gradient-to-br", previewData.gradient)} />
        
        {/* Декоративные элементы */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full -ml-12 -mt-12" />
        </div>

        {/* Основной контент */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white z-10">
            <div className="text-7xl mb-4 drop-shadow-lg">{previewData.icon}</div>
            <div className="text-xl font-semibold mb-2 drop-shadow">{previewData.typeLabel}</div>
            <div className="text-sm opacity-90 max-w-xs mx-auto px-4">
              {leadMagnet.description || 'Нажмите для просмотра'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const aspectRatio = getPreviewAspectRatio()
  const dynamicStyles = getDynamicPreviewStyles()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={cn(
        "w-full",
        // Применяем класс aspect ratio только если нет динамических стилей с auto
        (dynamicStyles as any).aspectRatio === 'auto' ? '' : aspectRatio,
        className
      )}
      style={{
        // Применяем динамические стили
        ...((dynamicStyles as any).aspectRatio && (dynamicStyles as any).aspectRatio !== 'auto' && { aspectRatio: (dynamicStyles as any).aspectRatio }),
        ...((dynamicStyles as any).maxHeight && { maxHeight: (dynamicStyles as any).maxHeight }),
        ...((dynamicStyles as any).objectFit && { objectFit: (dynamicStyles as any).objectFit }),
      }}
    >
      {getPreviewContent()}
    </motion.div>
  )
}
