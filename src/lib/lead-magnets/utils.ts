/**
 * Утилиты для работы с лид-магнитами
 * - Генерация slug
 * - Форматирование размера файла
 * - Определение типа preview
 */

import type { LeadMagnetType, LeadMagnet } from '@/types/lead-magnet'

/**
 * Транслитерация русского текста в латиницу
 */
function transliterate(text: string): string {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  }

  return text
    .split('')
    .map(char => map[char] || char)
    .join('')
}

/**
 * Генерация slug из заголовка лид-магнита
 */
export function generateSlug(title: string, existingSlugs: string[] = []): string {
  // Транслитерация и нормализация
  let slug = transliterate(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Только буквы, цифры, пробелы, дефисы
    .replace(/\s+/g, '-') // Пробелы в дефисы
    .replace(/-+/g, '-') // Множественные дефисы в один
    .replace(/^-|-$/g, '') // Убираем дефисы в начале и конце
    .substring(0, 50) // Макс 50 символов

  // Проверка уникальности
  if (!existingSlugs.includes(slug)) {
    return slug
  }

  // Если slug существует, добавляем номер
  let counter = 2
  let newSlug = `${slug}-${counter}`
  
  while (existingSlugs.includes(newSlug)) {
    counter++
    newSlug = `${slug}-${counter}`
  }

  return newSlug
}

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Определение MIME типа файла по расширению
 */
export function getMimeTypeFromUrl(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase()
  
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'txt': 'text/plain',
  }

  return mimeTypes[extension || ''] || 'application/octet-stream'
}

/**
 * Получение иконки для типа файла
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('video')) return '🎥'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
  if (mimeType.includes('text')) return '📃'
  
  return '📁'
}

/**
 * Проверка: нужно ли показывать preview для этого лид-магнита
 */
export function shouldShowPreview(leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'ogImage'>): boolean {
  // Для файлов всегда показываем (иконка + размер)
  if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
    return true
  }

  // Для ссылок показываем только если есть OG image
  if (leadMagnet.type === 'link' && leadMagnet.ogImage) {
    return true
  }

  // Для услуг не показываем preview
  return false
}

/**
 * Получение данных для preview блока
 */
export function getPreviewData(leadMagnet: Pick<LeadMagnet, 'type' | 'fileUrl' | 'linkUrl' | 'ogImage' | 'fileSize'>) {
  if (leadMagnet.type === 'file' && leadMagnet.fileUrl) {
    const mimeType = getMimeTypeFromUrl(leadMagnet.fileUrl)
    const icon = getFileIcon(mimeType)
    const fileName = leadMagnet.fileUrl.split('/').pop() || 'file'
    
    return {
      type: 'file' as const,
      icon,
      fileName,
      fileSize: leadMagnet.fileSize || null,
      mimeType,
    }
  }

  if (leadMagnet.type === 'link' && leadMagnet.ogImage) {
    return {
      type: 'link' as const,
      imageUrl: leadMagnet.ogImage,
    }
  }

  return null
}

/**
 * Генерация базовых Open Graph тегов для лид-магнита
 */
export function generateOGTags(
  leadMagnet: Pick<LeadMagnet, 'title' | 'description' | 'type' | 'ogImage' | 'emoji'>,
  specialist: {
    firstName: string
    lastName: string
    avatar?: string | null
  }
) {
  const title = `${leadMagnet.emoji} ${leadMagnet.title} — ${specialist.firstName} ${specialist.lastName}`
  const description = leadMagnet.description
  
  // Изображение: OG image лид-магнита или аватар специалиста
  const image = leadMagnet.ogImage || specialist.avatar || '/og-default.png'

  return {
    title,
    description,
    image,
    type: 'website',
  }
}

/**
 * Валидация highlights (максимум 5 пунктов)
 */
export function validateHighlights(highlights: string[]): {
  valid: boolean
  error?: string
  sanitized: string[]
} {
  if (highlights.length > 5) {
    return {
      valid: false,
      error: 'Максимум 5 пунктов в списке "Что внутри"',
      sanitized: highlights.slice(0, 5),
    }
  }

  // Убираем пустые строки и trim
  const sanitized = highlights
    .map(h => h.trim())
    .filter(h => h.length > 0)

  return {
    valid: true,
    sanitized,
  }
}

/**
 * Проверка: показывать ли социальное доказательство
 */
export function shouldShowSocialProof(downloadCount: number): boolean {
  return downloadCount > 10
}

/**
 * Форматирование счетчика скачиваний
 */
export function formatDownloadCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`
  return `${(count / 1000000).toFixed(1)}M`
}

