/**
 * Конфигурация Cloudinary для загрузки медиа файлов
 */

import { v2 as cloudinary } from 'cloudinary'

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

/**
 * Проверка настройки Cloudinary
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

/**
 * Загрузка изображения в Cloudinary
 * @param base64Image - изображение в формате base64 или buffer
 * @param folder - папка в Cloudinary (например: 'avatars', 'certificates', 'gallery')
 * @param publicId - уникальный идентификатор (опционально)
 */
export async function uploadImage(
  base64Image: string,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary не настроен. Проверьте переменные окружения.')
  }

  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `aura/${folder}`,
      public_id: publicId,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      overwrite: true,
      invalidate: true
    })

    return {
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Ошибка загрузки в Cloudinary:', error)
    throw error
  }
}

/**
 * Загрузка документа в Cloudinary (без трансформаций)
 * @param base64File - файл в формате base64
 * @param folder - папка в Cloudinary (например: 'lead-magnets', 'documents')
 * @param publicId - уникальный идентификатор (опционально)
 */
export async function uploadDocument(
  base64File: string,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary не настроен. Проверьте переменные окружения.')
  }

  try {
    const result = await cloudinary.uploader.upload(base64File, {
      folder: `aura/${folder}`,
      public_id: publicId,
      resource_type: 'raw', // 🔴 КРИТИЧНО: для PDF и других документов
      type: 'upload', // Публичная загрузка
      // БЕЗ трансформаций для сохранения оригинального формата
      overwrite: true,
      invalidate: true
    })

    return {
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Ошибка загрузки документа в Cloudinary:', error)
    throw error
  }
}

/**
 * Загрузка PDF файла в Cloudinary
 * Специализированная функция для PDF с правильными настройками доступа
 * @param base64File - PDF файл в формате base64
 * @param folder - папка в Cloudinary
 * @param publicId - уникальный идентификатор (опционально)
 */
export async function uploadPDF(
  base64File: string,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary не настроен. Проверьте переменные окружения.')
  }

  try {
    const result = await cloudinary.uploader.upload(base64File, {
      folder: `aura/${folder}`,
      public_id: publicId,
      resource_type: 'raw', // КРИТИЧНО для PDF
      type: 'upload', // Публичный доступ
      access_mode: 'public', // Явно указываем публичный доступ
      overwrite: true,
      invalidate: true
    })

    return {
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Ошибка загрузки PDF в Cloudinary:', error)
    throw error
  }
}

/**
 * Загрузка аватара с оптимизацией
 * Автоматически обрезает до квадрата и ресайзит до 400x400
 */
export async function uploadAvatar(
  base64Image: string,
  specialistId: string
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'aura/avatars',
      public_id: `avatar_${specialistId}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      overwrite: true,
      invalidate: true
    })

    return result.secure_url
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error)
    throw error
  }
}

/**
 * Удаление изображения из Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured()) {
    return
  }

  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Ошибка удаления из Cloudinary:', error)
    // Не бросаем ошибку - удаление не критично
  }
}

export { cloudinary }

