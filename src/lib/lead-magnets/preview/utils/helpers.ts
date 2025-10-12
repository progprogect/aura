/**
 * Вспомогательные функции для preview системы
 */

import { CONTENT_GRADIENTS, CONTENT_ICONS, FILE_EXTENSIONS } from './constants'

/**
 * Получить градиент для типа контента
 */
export function getContentGradient(type: string): string {
  return CONTENT_GRADIENTS[type as keyof typeof CONTENT_GRADIENTS] || CONTENT_GRADIENTS.unknown
}

/**
 * Получить иконку для типа контента
 */
export function getContentIcon(type: string): string {
  return CONTENT_ICONS[type as keyof typeof CONTENT_ICONS] || CONTENT_ICONS.unknown
}

/**
 * Получить расширение файла из URL
 */
export function getFileExtension(url?: string | null): string | undefined {
  if (!url) return undefined
  
  try {
    const pathname = new URL(url).pathname
    const extension = pathname.split('.').pop()
    return extension?.toLowerCase()
  } catch {
    return undefined
  }
}

/**
 * Определить тип файла по расширению
 */
export function getFileTypeByExtension(extension?: string): string {
  if (!extension) return 'unknown'
  
  const normalizedExt = extension.startsWith('.') ? extension : `.${extension}`
  
  for (const [type, extensions] of Object.entries(FILE_EXTENSIONS)) {
    if ((extensions as readonly string[]).includes(normalizedExt)) {
      return type
    }
  }
  
  return 'unknown'
}

/**
 * Проверить является ли URL изображением
 */
export function isImageUrl(url: string): boolean {
  const extension = getFileExtension(url)
  if (!extension) return false
  
  const imageExtensions = FILE_EXTENSIONS.image
  return imageExtensions.some(ext => ext === `.${extension}`)
}

/**
 * Проверить является ли URL PDF
 */
export function isPDFUrl(url: string): boolean {
  return url.toLowerCase().includes('.pdf')
}

/**
 * Форматировать размер файла
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Генерировать srcset строку
 */
export function generateSrcSet(urls: {
  thumbnail: string
  card: string
  detail: string
}): string {
  return [
    `${urls.thumbnail} 400w`,
    `${urls.card} 800w`,
    `${urls.detail} 1200w`
  ].join(', ')
}

/**
 * Генерировать sizes строку
 */
export function generateSizes(type: 'card' | 'detail' = 'card'): string {
  if (type === 'detail') {
    return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
  }
  
  return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px'
}

/**
 * Извлечь YouTube video ID из URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

/**
 * Получить YouTube thumbnail URL
 */
export function getYouTubeThumbnail(url: string): string | null {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null
  
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

/**
 * Проверить является ли URL YouTube
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

/**
 * Проверить является ли URL Vimeo
 */
export function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com')
}

/**
 * Получить цвет badge для типа лид-магнита
 */
export function getLeadMagnetBadgeColor(type: string): string {
  switch (type) {
    case 'file':
      return 'bg-blue-100 text-blue-800'
    case 'link':
      return 'bg-purple-100 text-purple-800'
    case 'service':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Заглушка для обратной совместимости (для старых компонентов)
 */
export function getLeadMagnetPreviewData(leadMagnet: any) {
  // Возвращаем минимальные данные для работы старых компонентов
  return {
    type: leadMagnet.type,
    title: leadMagnet.title,
    emoji: leadMagnet.emoji || '🎁'
  }
}

