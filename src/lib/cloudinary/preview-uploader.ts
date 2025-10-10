/**
 * Специализированный модуль для загрузки превью в Cloudinary
 * С поддержкой responsive images (3 размера)
 */

import { v2 as cloudinary } from 'cloudinary'
import { isCloudinaryConfigured } from './config'

/**
 * Размеры для responsive images
 */
export const PREVIEW_SIZES = {
  thumbnail: { width: 400, height: 300, quality: 80 },  // Для карточек mobile
  card: { width: 800, height: 600, quality: 85 },       // Для карточек desktop
  detail: { width: 1200, height: 900, quality: 90 },    // Для детальной страницы
} as const

/**
 * Результат загрузки превью со всеми размерами
 */
export interface PreviewUrls {
  thumbnail: string
  card: string
  detail: string
  original?: string
}

/**
 * Загрузить превью в Cloudinary с генерацией responsive размеров
 * @param imageBuffer - Buffer изображения
 * @param leadMagnetId - ID лид-магнита для уникального публичного ID
 * @returns URLs для всех размеров
 */
export async function uploadPreviewResponsive(
  imageBuffer: Buffer,
  leadMagnetId: string
): Promise<PreviewUrls> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary не настроен')
  }

  try {
    // Конвертируем buffer в base64
    const base64 = `data:image/webp;base64,${imageBuffer.toString('base64')}`

    // Загружаем оригинал с автоматической оптимизацией
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: 'aura/previews',
      public_id: `preview_${leadMagnetId}`,
      resource_type: 'image',
      format: 'webp', // Принудительно WebP для лучшего сжатия
      overwrite: true,
      invalidate: true, // Инвалидация CDN кеша
      // Автоматические оптимизации Cloudinary
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' } // AVIF для поддерживающих браузеров
      ]
    })

    const baseUrl = uploadResult.secure_url
    const publicId = uploadResult.public_id

    // Генерируем URLs для всех размеров через Cloudinary transformations
    const thumbnailUrl = cloudinary.url(publicId, {
      transformation: [
        { width: PREVIEW_SIZES.thumbnail.width, height: PREVIEW_SIZES.thumbnail.height, crop: 'fill' },
        { quality: PREVIEW_SIZES.thumbnail.quality },
        { fetch_format: 'auto' }
      ],
      secure: true
    })

    const cardUrl = cloudinary.url(publicId, {
      transformation: [
        { width: PREVIEW_SIZES.card.width, height: PREVIEW_SIZES.card.height, crop: 'fill' },
        { quality: PREVIEW_SIZES.card.quality },
        { fetch_format: 'auto' }
      ],
      secure: true
    })

    const detailUrl = cloudinary.url(publicId, {
      transformation: [
        { width: PREVIEW_SIZES.detail.width, height: PREVIEW_SIZES.detail.height, crop: 'fill' },
        { quality: PREVIEW_SIZES.detail.quality },
        { fetch_format: 'auto' }
      ],
      secure: true
    })

    return {
      thumbnail: thumbnailUrl,
      card: cardUrl,
      detail: detailUrl,
      original: baseUrl
    }
  } catch (error) {
    console.error('[Preview Uploader] Ошибка загрузки:', error)
    throw new Error('Не удалось загрузить превью в Cloudinary')
  }
}

/**
 * Загрузить превью из base64 data URL
 * @param dataUrl - base64 data URL
 * @param leadMagnetId - ID лид-магнита
 */
export async function uploadPreviewFromDataUrl(
  dataUrl: string,
  leadMagnetId: string
): Promise<PreviewUrls> {
  // Извлекаем base64 из data URL
  const base64Data = dataUrl.split(',')[1]
  const buffer = Buffer.from(base64Data, 'base64')
  
  return uploadPreviewResponsive(buffer, leadMagnetId)
}

/**
 * Генерировать srcset строку для responsive image
 * @param urls - объект с URLs для разных размеров
 */
export function generateSrcSet(urls: PreviewUrls): string {
  return [
    `${urls.thumbnail} 400w`,
    `${urls.card} 800w`,
    `${urls.detail} 1200w`
  ].join(', ')
}

/**
 * Генерировать sizes строку для responsive image
 * @param type - тип использования (card, detail)
 */
export function generateSizes(type: 'card' | 'detail' = 'card'): string {
  if (type === 'detail') {
    return '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
  }
  
  // Для карточек
  return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px'
}

/**
 * Удалить превью из Cloudinary
 * @param leadMagnetId - ID лид-магнита
 */
export async function deletePreview(leadMagnetId: string): Promise<void> {
  if (!isCloudinaryConfigured()) {
    return
  }

  try {
    const publicId = `aura/previews/preview_${leadMagnetId}`
    await cloudinary.uploader.destroy(publicId)
    console.log(`[Preview Uploader] Превью ${publicId} удалено`)
  } catch (error) {
    console.error('[Preview Uploader] Ошибка удаления превью:', error)
    // Не бросаем ошибку - удаление не критично
  }
}

