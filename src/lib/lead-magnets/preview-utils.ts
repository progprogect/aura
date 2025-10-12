/**
 * Утилиты для работы с превью лид-магнитов
 */

import type { LeadMagnetType, PreviewUrls } from '@/types/lead-magnet'
import { PREVIEW_FILE_LIMITS, FALLBACK_GRADIENTS } from './constants'

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Валидация файла превью
 * @param file - File для валидации
 * @returns Результат валидации
 */
export function validatePreviewFile(file: File): ValidationResult {
  // Проверка типа файла
  if (!PREVIEW_FILE_LIMITS.VALID_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Неподдерживаемый формат. Используйте JPG, PNG или WebP'
    }
  }

  // Проверка размера
  if (file.size > PREVIEW_FILE_LIMITS.MAX_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1)
    const maxSizeMB = (PREVIEW_FILE_LIMITS.MAX_SIZE / 1024 / 1024).toFixed(0)
    return {
      valid: false,
      error: `Файл слишком большой (${sizeMB}MB). Максимум ${maxSizeMB}MB`
    }
  }

  return { valid: true }
}

/**
 * Получить URL превью нужного размера
 * @param previewUrls - объект с URLs
 * @param type - тип превью (card или detail)
 * @returns URL превью или null
 */
export function getPreviewUrl(
  previewUrls: PreviewUrls | null | undefined,
  type: 'thumbnail' | 'card' | 'detail' = 'card'
): string | null {
  if (!previewUrls) return null
  return previewUrls[type] || null
}

/**
 * Получить CSS градиент для fallback превью (для фронтенда)
 * @param type - тип лид-магнита
 * @returns CSS linear-gradient строка
 */
export function getFallbackGradient(type: LeadMagnetType): string {
  const colors = FALLBACK_GRADIENTS[type] || FALLBACK_GRADIENTS.file
  return `linear-gradient(135deg, ${colors.start} 0%, ${colors.end} 100%)`
}

/**
 * Проверить, является ли изображение квадратным
 * @param file - File изображения
 * @returns Promise<boolean>
 */
export async function isSquareImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img.width === img.height)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(false)
    }

    img.src = url
  })
}

/**
 * Получить dimensions изображения
 * @param file - File изображения
 * @returns Promise<{width: number, height: number}>
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    img.src = url
  })
}

/**
 * Конвертировать File в base64
 * @param file - File для конвертации
 * @returns Promise<string> base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Проверить, нужно ли показывать превью для типа лид-магнита на детальной странице
 * Для "service" показываем только форму, а не превью
 */
export function shouldShowPreviewOnDetailPage(type: LeadMagnetType): boolean {
  return type !== 'service'
}

/**
 * Форматировать размер файла для отображения
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

