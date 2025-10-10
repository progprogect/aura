/**
 * Оптимизация и сжатие изображений для превью лид-магнитов
 * Использует sharp для генерации WebP и thumbnails
 */

import sharp from 'sharp'

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'png' | 'jpeg'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

/**
 * Оптимизирует изображение из Buffer
 */
export async function optimizeImageFromBuffer(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  const {
    width = 800,
    height = 600,
    quality = 85,
    format = 'webp',
    fit = 'cover'
  } = options

  try {
    const sharpInstance = sharp(buffer)
      .resize(width, height, { fit })
    
    switch (format) {
      case 'webp':
        return await sharpInstance.webp({ quality }).toBuffer()
      case 'png':
        return await sharpInstance.png({ quality }).toBuffer()
      case 'jpeg':
        return await sharpInstance.jpeg({ quality }).toBuffer()
      default:
        return await sharpInstance.webp({ quality }).toBuffer()
    }
  } catch (error) {
    console.error('[Image Optimizer] Ошибка оптимизации:', error)
    throw new Error('Failed to optimize image')
  }
}

/**
 * Оптимизирует изображение из URL
 */
export async function optimizeImageFromUrl(
  url: string,
  options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return await optimizeImageFromBuffer(buffer, options)
  } catch (error) {
    console.error('[Image Optimizer] Ошибка загрузки изображения:', error)
    throw new Error('Failed to optimize image from URL')
  }
}

/**
 * Генерирует превью для карточки (небольшой размер)
 */
export async function generateCardPreview(
  imageSource: Buffer | string
): Promise<Buffer> {
  const buffer = typeof imageSource === 'string' 
    ? await optimizeImageFromUrl(imageSource, { width: 400, height: 300, quality: 80 })
    : await optimizeImageFromBuffer(imageSource, { width: 400, height: 300, quality: 80 })

  return buffer
}

/**
 * Генерирует превью для детальной страницы (средний размер)
 */
export async function generateDetailPreview(
  imageSource: Buffer | string
): Promise<Buffer> {
  const buffer = typeof imageSource === 'string'
    ? await optimizeImageFromUrl(imageSource, { width: 1200, height: 800, quality: 85 })
    : await optimizeImageFromBuffer(imageSource, { width: 1200, height: 800, quality: 85 })

  return buffer
}

/**
 * Определяет формат изображения по Buffer
 */
export async function detectImageFormat(buffer: Buffer): Promise<string> {
  try {
    const metadata = await sharp(buffer).metadata()
    return metadata.format || 'unknown'
  } catch (error) {
    console.error('[Image Optimizer] Ошибка определения формата:', error)
    return 'unknown'
  }
}

