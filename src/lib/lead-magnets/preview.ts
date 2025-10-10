/**
 * Утилиты для генерации визуальных превью лид-магнитов
 * Современный UX 2025: градиенты, иконки, fallbacks
 */

import { 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  FileVideo,
  File,
  Link as LinkIcon,
  Users,
  Clock,
  Download
} from 'lucide-react'

// Градиенты для превью по типу ресурса
export const PREVIEW_GRADIENTS = {
  file: {
    pdf: 'from-red-500 to-orange-500',
    doc: 'from-blue-500 to-cyan-500',
    docx: 'from-blue-500 to-cyan-500',
    xls: 'from-green-500 to-emerald-500',
    xlsx: 'from-green-500 to-emerald-500',
    ppt: 'from-orange-500 to-red-500',
    pptx: 'from-orange-500 to-red-500',
    jpg: 'from-purple-500 to-pink-500',
    jpeg: 'from-purple-500 to-pink-500',
    png: 'from-purple-500 to-pink-500',
    gif: 'from-purple-500 to-pink-500',
    mp4: 'from-indigo-500 to-purple-500',
    avi: 'from-indigo-500 to-purple-500',
    mov: 'from-indigo-500 to-purple-500',
    default: 'from-gray-500 to-slate-500'
  },
  link: 'from-purple-500 to-pink-500',
  service: 'from-indigo-500 to-blue-500'
} as const

// Иконки файлов по расширению
export const FILE_ICONS = {
  'pdf': FileText,
  'doc': FileText,
  'docx': FileText,
  'xls': FileSpreadsheet,
  'xlsx': FileSpreadsheet,
  'ppt': FileText,
  'pptx': FileText,
  'jpg': FileImage,
  'jpeg': FileImage,
  'png': FileImage,
  'gif': FileImage,
  'mp4': FileVideo,
  'avi': FileVideo,
  'mov': FileVideo,
  'default': File
} as const

// Иконки для типов лид-магнитов
export const TYPE_ICONS = {
  file: File,
  link: LinkIcon,
  service: Users
} as const

// Получить градиент для превью
export function getPreviewGradient(type: 'file' | 'link' | 'service', fileExtension?: string): string {
  if (type === 'file' && fileExtension) {
    const ext = fileExtension.toLowerCase() as keyof typeof PREVIEW_GRADIENTS.file
    return PREVIEW_GRADIENTS.file[ext] || PREVIEW_GRADIENTS.file.default
  }
  
  if (type === 'link') return PREVIEW_GRADIENTS.link
  if (type === 'service') return PREVIEW_GRADIENTS.service
  
  return PREVIEW_GRADIENTS.file.default
}

// Получить иконку для файла
export function getFileIcon(fileExtension?: string) {
  if (!fileExtension) return FILE_ICONS.default
  
  const ext = fileExtension.toLowerCase() as keyof typeof FILE_ICONS
  return FILE_ICONS[ext] || FILE_ICONS.default
}

// Получить расширение файла из URL
export function getFileExtension(url?: string | null): string | undefined {
  if (!url) return undefined
  
  try {
    const pathname = new URL(url).pathname
    const extension = pathname.split('.').pop()
    return extension?.toLowerCase()
  } catch {
    return undefined
  }
}

// Получить тип файла по расширению
export function getFileType(extension?: string): string {
  if (!extension) return 'Файл'
  
  const typeMap: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    xls: 'Excel',
    xlsx: 'Excel',
    ppt: 'PowerPoint',
    pptx: 'PowerPoint',
    jpg: 'Изображение',
    jpeg: 'Изображение',
    png: 'Изображение',
    gif: 'Изображение',
    mp4: 'Видео',
    avi: 'Видео',
    mov: 'Видео'
  }
  
  return typeMap[extension.toLowerCase()] || 'Файл'
}

// Форматирование метаинформации для карточки
export function formatCardMeta(type: 'file' | 'link' | 'service', fileSize?: string | null, downloadCount?: number, fileExtension?: string): string {
  const parts: string[] = []
  
  if (type === 'file') {
    const fileType = getFileType(fileExtension)
    parts.push(fileType)
    
    if (fileSize) {
      parts.push(fileSize)
    }
  } else if (type === 'link') {
    parts.push('Ссылка')
  } else if (type === 'service') {
    parts.push('Услуга')
  }
  
  if (downloadCount && downloadCount > 0) {
    if (downloadCount === 1) {
      parts.push('1 скачивание')
    } else if (downloadCount < 5) {
      parts.push(`${downloadCount} скачивания`)
    } else {
      parts.push(`${downloadCount} скачиваний`)
    }
  }
  
  return parts.join(' • ')
}

// Получить цвет для бейджа аудитории
export function getAudienceBadgeColor(audience?: string | null): string {
  if (!audience) return 'bg-gray-100 text-gray-700'
  
  const lowerAudience = audience.toLowerCase()
  
  if (lowerAudience.includes('нович') || lowerAudience.includes('начина')) {
    return 'bg-green-100 text-green-700'
  }
  
  if (lowerAudience.includes('продвинут') || lowerAudience.includes('эксперт')) {
    return 'bg-purple-100 text-purple-700'
  }
  
  if (lowerAudience.includes('средн')) {
    return 'bg-blue-100 text-blue-700'
  }
  
  return 'bg-gray-100 text-gray-700'
}

// Проверить, нужно ли показывать social proof
export function shouldShowSocialProof(downloadCount?: number): boolean {
  return (downloadCount || 0) >= 10
}

// Форматировать количество скачиваний для социального доказательства
export function formatSocialProof(downloadCount: number): string {
  if (downloadCount >= 1000) {
    return `${Math.floor(downloadCount / 1000)}k+ скачиваний`
  }
  
  if (downloadCount >= 100) {
    return `${Math.floor(downloadCount / 100) * 100}+ скачиваний`
  }
  
  if (downloadCount >= 10) {
    return `${downloadCount}+ скачиваний`
  }
  
  return `${downloadCount} скачиваний`
}
