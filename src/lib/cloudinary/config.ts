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
      access_mode: 'public', // Явно указываем публичный доступ
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

    // Валидация: проверяем что PDF загружен как raw (warning, не throw)
    if (!result.secure_url.includes('/raw/upload/')) {
      console.warn('⚠️  WARNING: PDF может быть загружен с неправильным resource_type')
      console.warn('   URL:', result.secure_url)
      console.warn('   Ожидается /raw/upload/ в URL для корректного доступа')
    } else {
      console.log('✅ Валидация успешна: PDF загружен как raw resource')
    }

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
 * Генерация превью URL для PDF через Cloudinary трансформации
 * Cloudinary может генерировать превью из PDF без canvas!
 * @param pdfUrl - URL PDF файла в Cloudinary (raw)
 * @param size - размер превью (thumbnail/card/detail)
 * @returns URL превью изображения
 */
export function generatePDFPreviewUrl(
  pdfUrl: string,
  size: 'thumbnail' | 'card' | 'detail' = 'card'
): string {
  // Проверяем что это Cloudinary URL
  if (!pdfUrl.includes('res.cloudinary.com')) {
    console.warn('generatePDFPreviewUrl: не Cloudinary URL, возвращаем исходный')
    return pdfUrl
  }

  // Проверяем что это raw/upload (PDF)
  if (!pdfUrl.includes('/raw/upload/')) {
    console.warn('generatePDFPreviewUrl: не raw resource, возвращаем исходный')
    return pdfUrl
  }

  // Параметры трансформации для разных размеров
  const transformations = {
    thumbnail: 'f_jpg,pg_1,w_400,h_300,c_fit,q_80',  // первая страница, 400x300
    card: 'f_jpg,pg_1,w_800,h_600,c_fit,q_85',       // первая страница, 800x600
    detail: 'f_jpg,pg_1,w_1200,h_900,c_fit,q_90'     // первая страница, 1200x900
  }

  // Заменяем /raw/upload/ на /image/upload/ + добавляем трансформации
  const previewUrl = pdfUrl.replace(
    '/raw/upload/',
    `/image/upload/${transformations[size]}/`
  )

  console.log(`[Cloudinary] Генерация PDF preview (${size}):`, previewUrl)
  
  return previewUrl
}

/**
 * Генерация всех размеров превью для PDF
 * @param pdfUrl - URL PDF файла в Cloudinary
 * @returns Объект с URL для всех размеров
 */
export function generatePDFPreviewUrls(pdfUrl: string): {
  thumbnail: string
  card: string
  detail: string
} {
  return {
    thumbnail: generatePDFPreviewUrl(pdfUrl, 'thumbnail'),
    card: generatePDFPreviewUrl(pdfUrl, 'card'),
    detail: generatePDFPreviewUrl(pdfUrl, 'detail')
  }
}

/**
 * Загрузка кастомного превью для лид-магнита
 * @param file - Buffer или base64 изображения
 * @param leadMagnetId - ID лид-магнита
 * @returns URLs для всех размеров превью
 */
export async function uploadCustomPreview(
  file: Buffer | string,
  leadMagnetId: string
): Promise<{ thumbnail: string; card: string; detail: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary не настроен. Проверьте переменные окружения.')
  }

  try {
    // Конвертируем Buffer в base64 если нужно
    const base64Image = Buffer.isBuffer(file) 
      ? `data:image/png;base64,${file.toString('base64')}`
      : file

    const publicId = `preview_${leadMagnetId}_${Date.now()}`
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'aura/lead-magnets/custom-previews',
      public_id: publicId,
      transformation: [
        { width: 800, height: 800, crop: 'fill', gravity: 'center' }, // Квадрат
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      overwrite: true,
      invalidate: true
    })

    // Генерируем responsive URLs
    const previewUrls = generatePreviewUrlsFromPublicId(result.public_id)

    return {
      ...previewUrls,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Ошибка загрузки кастомного превью в Cloudinary:', error)
    throw error
  }
}

/**
 * Загрузка fallback превью (сгенерированного через Canvas)
 * @param buffer - Buffer PNG изображения
 * @param leadMagnetId - ID лид-магнита
 * @returns URLs для всех размеров превью
 */
export async function uploadFallbackPreview(
  buffer: Buffer,
  leadMagnetId: string
): Promise<{ thumbnail: string; card: string; detail: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary не настроен. Проверьте переменные окружения.')
  }

  try {
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`
    const publicId = `fallback_${leadMagnetId}_${Date.now()}`
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'aura/lead-magnets/fallback-previews',
      public_id: publicId,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      overwrite: true,
      invalidate: true
    })

    // Генерируем responsive URLs
    const previewUrls = generatePreviewUrlsFromPublicId(result.public_id)

    return {
      ...previewUrls,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Ошибка загрузки fallback превью в Cloudinary:', error)
    throw error
  }
}

/**
 * Генерация responsive URLs из publicId
 * @param publicId - Public ID изображения в Cloudinary
 * @returns URLs для разных размеров
 */
export function generatePreviewUrlsFromPublicId(publicId: string): {
  thumbnail: string
  card: string
  detail: string
} {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`

  return {
    thumbnail: `${baseUrl}/w_200,h_200,c_fill,q_80,f_auto/${publicId}`,
    card: `${baseUrl}/w_400,h_400,c_fill,q_85,f_auto/${publicId}`,
    detail: `${baseUrl}/w_800,h_800,c_fill,q_90,f_auto/${publicId}`
  }
}

/**
 * Удаление превью из Cloudinary
 * @param publicId - Public ID изображения
 */
export async function deletePreview(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured()) {
    return
  }

  try {
    await cloudinary.uploader.destroy(publicId)
    console.log(`[Cloudinary] Превью удалено: ${publicId}`)
  } catch (error) {
    console.error('Ошибка удаления превью из Cloudinary:', error)
    // Не бросаем ошибку - удаление не критично
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

