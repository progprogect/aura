/**
 * Универсальный генератор превью для всех типов лид-магнитов
 * Центральная точка для создания превью при загрузке
 */

import type { LeadMagnet } from '@/types/lead-magnet'
import { generateCardPreview, optimizeImageFromUrl } from './image-optimizer'
import { generatePDFCardPreview, isPDFUrl } from './pdf-preview-server'
import { generateServiceCardPreview } from './service-card-generator'
import { 
  detectContentFromUrl, 
  getVideoThumbnailUrl,
  type Platform 
} from './content-detector'
import { 
  getYouTubeThumbnail, 
  isYouTubeUrl, 
  isVimeoUrl 
} from './preview'

export interface PreviewGenerationResult {
  success: boolean
  previewBuffer?: Buffer
  previewType?: 'image' | 'video-thumbnail' | 'pdf' | 'service-card' | 'og-image'
  error?: string
}

/**
 * Генерирует превью для лид-магнита на основе его типа
 */
export async function generateUniversalPreview(
  leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'ogImage' | 'title' | 'description' | 'emoji' | 'highlights'>
): Promise<PreviewGenerationResult> {
  try {
    // Для файлов
    if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
      return await generateFilePreview(leadMagnet.fileUrl)
    }

    // Для ссылок
    if (leadMagnet.type === 'link' && leadMagnet.linkUrl) {
      return await generateLinkPreview(leadMagnet.linkUrl, leadMagnet.ogImage)
    }

    // Для сервисов
    if (leadMagnet.type === 'service') {
      return await generateServicePreview(leadMagnet)
    }

    return {
      success: false,
      error: 'Unsupported lead magnet type'
    }
  } catch (error) {
    console.error('[Universal Preview Generator] Ошибка:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Генерирует превью для файла
 */
async function generateFilePreview(fileUrl: string): Promise<PreviewGenerationResult> {
  try {
    // PDF файлы
    if (isPDFUrl(fileUrl)) {
      const pdfBuffer = await generatePDFCardPreview(fileUrl)
      if (pdfBuffer) {
        return {
          success: true,
          previewBuffer: pdfBuffer,
          previewType: 'pdf'
        }
      }
      return {
        success: false,
        error: 'Failed to generate PDF preview'
      }
    }

    // Изображения - оптимизируем и создаем превью
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const isImage = imageExtensions.some(ext => fileUrl.toLowerCase().endsWith(ext))
    
    if (isImage) {
      const buffer = await generateCardPreview(fileUrl)
      return {
        success: true,
        previewBuffer: buffer,
        previewType: 'image'
      }
    }

    // Видео файлы - пока не генерируем превью, возвращаем ошибку для фолбэка
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    const isVideo = videoExtensions.some(ext => fileUrl.toLowerCase().endsWith(ext))
    
    if (isVideo) {
      return {
        success: false,
        error: 'Video preview generation not implemented yet'
      }
    }

    // Для остальных типов файлов - возвращаем ошибку для фолбэка
    return {
      success: false,
      error: 'Unsupported file type for preview generation'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'File preview error'
    }
  }
}

/**
 * Генерирует превью для ссылки
 */
async function generateLinkPreview(
  linkUrl: string, 
  ogImage?: string | null
): Promise<PreviewGenerationResult> {
  try {
    // YouTube видео
    if (isYouTubeUrl(linkUrl)) {
      const thumbnailUrl = getYouTubeThumbnail(linkUrl)
      if (thumbnailUrl) {
        const buffer = await generateCardPreview(thumbnailUrl)
        return {
          success: true,
          previewBuffer: buffer,
          previewType: 'video-thumbnail'
        }
      }
    }

    // Vimeo видео
    if (isVimeoUrl(linkUrl)) {
      const contentInfo = detectContentFromUrl(linkUrl)
      if (contentInfo.platform && contentInfo.id) {
        const thumbnailUrl = getVideoThumbnailUrl(contentInfo.platform, contentInfo.id)
        if (thumbnailUrl) {
          try {
            const buffer = await generateCardPreview(thumbnailUrl)
            return {
              success: true,
              previewBuffer: buffer,
              previewType: 'video-thumbnail'
            }
          } catch {
            // Vimeo thumbnail может не работать, переходим к OG image
          }
        }
      }
    }

    // Другие видео платформы
    const contentInfo = detectContentFromUrl(linkUrl)
    if (contentInfo.type === 'video' && contentInfo.platform && contentInfo.id) {
      const thumbnailUrl = getVideoThumbnailUrl(contentInfo.platform as Platform, contentInfo.id)
      if (thumbnailUrl) {
        try {
          const buffer = await generateCardPreview(thumbnailUrl)
          return {
            success: true,
            previewBuffer: buffer,
            previewType: 'video-thumbnail'
          }
        } catch {
          // Переходим к OG image
        }
      }
    }

    // OG Image для обычных ссылок
    if (ogImage) {
      const buffer = await generateCardPreview(ogImage)
      return {
        success: true,
        previewBuffer: buffer,
        previewType: 'og-image'
      }
    }

    // Если ничего не нашли - возвращаем ошибку для фолбэка
    return {
      success: false,
      error: 'No preview available for this link'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Link preview error'
    }
  }
}

/**
 * Генерирует превью для сервиса
 */
async function generateServicePreview(
  leadMagnet: Pick<LeadMagnet, 'title' | 'description' | 'emoji' | 'highlights'>
): Promise<PreviewGenerationResult> {
  try {
    const buffer = await generateServiceCardPreview(leadMagnet)
    return {
      success: true,
      previewBuffer: buffer,
      previewType: 'service-card'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Service preview error'
    }
  }
}

/**
 * Определяет нужно ли генерировать превью для лид-магнита
 */
export function shouldGeneratePreview(leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'ogImage'>): boolean {
  // Всегда генерируем для сервисов
  if (leadMagnet.type === 'service') {
    return true
  }

  // Для файлов - только если это PDF или изображение
  if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
    const isPDF = isPDFUrl(leadMagnet.fileUrl)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const isImage = imageExtensions.some(ext => leadMagnet.fileUrl!.toLowerCase().endsWith(ext))
    return isPDF || isImage
  }

  // Для ссылок - только если есть URL и (это видео платформа или есть OG image)
  if (leadMagnet.type === 'link' && leadMagnet.linkUrl) {
    const isVideo = isYouTubeUrl(leadMagnet.linkUrl) || isVimeoUrl(leadMagnet.linkUrl)
    return isVideo || !!leadMagnet.ogImage
  }

  return false
}

