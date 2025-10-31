/**
 * Cloudinary Storage для превью
 * Загрузка с поддержкой responsive images
 */

import type { StorageUploadResult, ResponsivePreviewUrls } from '../core/types'
import { uploadPreviewResponsive, deletePreview } from '@/lib/cloudinary/preview-uploader'

/**
 * Загрузить превью в Cloudinary с responsive размерами
 */
export async function uploadPreviewToCloudinary(
  buffer: Buffer,
  leadMagnetId: string
): Promise<StorageUploadResult> {
  try {
    console.log(`[Cloudinary Storage] Загрузка превью для лид-магнита ${leadMagnetId}`)

    const urls = await uploadPreviewResponsive(buffer, leadMagnetId)

    console.log(`[Cloudinary Storage] ✅ Превью загружено`)
    console.log(`  - Thumbnail: ${urls.thumbnail}`)
    console.log(`  - Card: ${urls.card}`)
    console.log(`  - Detail: ${urls.detail}`)

    return {
      urls,
      publicId: `preview_${leadMagnetId}`,
      provider: 'cloudinary'
    }
  } catch (error) {
    console.error('[Cloudinary Storage] Ошибка загрузки:', error)
    throw new Error('Failed to upload preview to Cloudinary')
  }
}

/**
 * Удалить превью из Cloudinary
 */
export async function deletePreviewFromCloudinary(leadMagnetId: string): Promise<void> {
  try {
    console.log(`[Cloudinary Storage] Удаление превью для лид-магнита ${leadMagnetId}`)
    await deletePreview(leadMagnetId)
    console.log(`[Cloudinary Storage] ✅ Превью удалено`)
  } catch (error) {
    console.error('[Cloudinary Storage] Ошибка удаления:', error)
    // Не бросаем ошибку - удаление не критично
  }
}

/**
 * Проверить доступность Cloudinary
 */
export function isCloudinaryAvailable(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

