/**
 * Безопасный парсинг previewUrls из БД
 * previewUrls может быть:
 * - null/undefined
 * - JSON string (из Prisma)
 * - Object (уже распарсенный)
 */

import type { PreviewUrls } from '@/types/lead-magnet'

export function parsePreviewUrls(urls: any): PreviewUrls | null {
  if (!urls) return null

  // Если уже объект - возвращаем как есть
  if (typeof urls === 'object' && 'card' in urls) {
    return urls as PreviewUrls
  }

  // Если string - пробуем парсить
  if (typeof urls === 'string') {
    try {
      const parsed = JSON.parse(urls)
      // Проверяем что это валидный PreviewUrls объект
      if (parsed && typeof parsed === 'object' && 'card' in parsed) {
        return parsed as PreviewUrls
      }
    } catch (error) {
      console.warn('[parsePreviewUrls] Не удалось распарсить:', error)
      return null
    }
  }

  return null
}

/**
 * Получить конкретный URL из previewUrls
 */
export function getPreviewUrl(
  urls: any,
  size: 'thumbnail' | 'card' | 'detail' = 'card'
): string | null {
  const parsed = parsePreviewUrls(urls)
  return parsed?.[size] ?? null
}

