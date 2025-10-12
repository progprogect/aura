/**
 * Preview utilities - экспорт для обратной совместимости
 * Re-export функций из preview/utils
 */

import { FileText, Image as ImageIcon, Link as LinkIcon, Gift, LucideIcon } from 'lucide-react'
import type { LeadMagnetType } from '@/types/lead-magnet'

// Re-export основных утилит
export {
  getFileExtension,
  isYouTubeUrl,
  getYouTubeThumbnail,
  getLeadMagnetBadgeColor,
  getLeadMagnetPreviewData,
  getFileTypeByExtension as getFileType,
  getContentIcon,
  getContentGradient
} from './preview/utils/helpers'

/**
 * Получить градиент для превью по типу (Tailwind classes)
 */
export function getPreviewGradient(type: string, fileExtension?: string): string {
  // Используем getContentGradient как base, но возвращаем Tailwind классы
  switch (type) {
    case 'file':
      if (fileExtension === 'pdf') {
        return 'from-red-500 to-orange-500'
      }
      return 'from-blue-500 to-indigo-500'
    case 'link':
      return 'from-purple-500 to-pink-500'
    case 'service':
      return 'from-green-500 to-emerald-500'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

/**
 * Получить иконку файла по расширению
 */
export function getFileIcon(fileExtension?: string): LucideIcon {
  if (!fileExtension) return FileText

  switch (fileExtension) {
    case 'pdf':
      return FileText
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
    case 'gif':
      return ImageIcon
    default:
      return FileText
  }
}

/**
 * Форматировать мета-информацию для карточки
 */
export function formatCardMeta(
  type: LeadMagnetType,
  fileSize?: string | null,
  downloadCount?: number,
  fileExtension?: string
): string {
  const parts: string[] = []

  // Тип
  if (type === 'file') {
    parts.push('Файл')
    if (fileExtension) {
      parts.push(fileExtension.toUpperCase())
    }
  } else if (type === 'link') {
    parts.push('Ссылка')
  } else if (type === 'service') {
    parts.push('Услуга')
  }

  // Размер файла
  if (fileSize) {
    parts.push(fileSize)
  }

  // Скачивания
  if (downloadCount && downloadCount > 0) {
    parts.push(`${downloadCount} скачиваний`)
  }

  return parts.join(' • ')
}

/**
 * Получить цвет badge для аудитории
 */
export function getAudienceBadgeColor(targetAudience?: string | null): string {
  if (!targetAudience) return 'bg-gray-100 text-gray-700'
  
  const lower = targetAudience.toLowerCase()
  
  if (lower.includes('новичк') || lower.includes('начинающ')) {
    return 'bg-green-100 text-green-700'
  }
  
  if (lower.includes('продвин') || lower.includes('профи')) {
    return 'bg-purple-100 text-purple-700'
  }
  
  return 'bg-blue-100 text-blue-700'
}

/**
 * Получить value badges для карточки
 */
export function getValueBadges(leadMagnet: {
  type: LeadMagnetType
  targetAudience?: string | null
  downloadCount?: number
}): Array<{ label: string; color: string }> {
  const badges: Array<{ label: string; color: string }> = []

  // Популярный (если много скачиваний)
  if (leadMagnet.downloadCount && leadMagnet.downloadCount > 100) {
    badges.push({
      label: '🔥 Популярно',
      color: 'bg-orange-500 text-white'
    })
  }

  // Новое (можно добавить логику по дате создания)
  
  return badges
}

