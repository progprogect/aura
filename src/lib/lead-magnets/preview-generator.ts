/**
 * Генератор превью для лид-магнитов
 * Создает превью для всех типов контента
 */

import { 
  detectContentFromUrl, 
  detectContentFromFileExtension, 
  getVideoThumbnailUrl, 
  getEmbedUrl, 
  getPlatformColor,
  type ContentInfo,
  type Platform 
} from './content-detector'

// Иконки для разных типов контента
export const CONTENT_ICONS = {
  // Видео платформы
  youtube: '📺',
  vimeo: '🎬',
  dailymotion: '🎥',
  twitch: '🎮',
  
  // Документы
  document: '📄',
  'google-docs': '📝',
  'office-online': '📊',
  notion: '📋',
  figma: '🎨',
  
  // Медиа
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  soundcloud: '🎧',
  spotify: '🎶',
  
  // Социальные
  social: '📱',
  instagram: '📸',
  twitter: '🐦',
  linkedin: '💼',
  
  // Файлы
  archive: '📦',
  text: '📃',
  presentation: '📊',
  spreadsheet: '📈',
  pdf: '📕',
  
  // Fallback
  unknown: '📎'
}

// Градиенты для разных типов
export const CONTENT_GRADIENTS = {
  video: 'from-red-500 to-red-600',
  document: 'from-blue-500 to-blue-600',
  image: 'from-green-500 to-green-600',
  audio: 'from-purple-500 to-purple-600',
  archive: 'from-orange-500 to-orange-600',
  text: 'from-gray-500 to-gray-600',
  presentation: 'from-yellow-500 to-yellow-600',
  spreadsheet: 'from-emerald-500 to-emerald-600',
  social: 'from-pink-500 to-pink-600',
  unknown: 'from-gray-400 to-gray-500'
}

export interface PreviewData {
  type: string
  platform?: Platform
  icon: string
  gradient: string
  thumbnailUrl?: string
  embedUrl?: string
  platformColor?: string
  isEmbeddable: boolean
  label: string
  extension?: string  // Расширение файла для определения типа (.pdf, .doc, и т.д.)
}

/**
 * Генерирует превью для ссылки
 */
export function generateLinkPreview(linkUrl: string, ogImage?: string): PreviewData {
  const contentInfo = detectContentFromUrl(linkUrl)
  
  // Для видео платформ
  if (contentInfo.type === 'video' && contentInfo.platform && contentInfo.id) {
    const thumbnailUrl = getVideoThumbnailUrl(contentInfo.platform, contentInfo.id)
    const embedUrl = getEmbedUrl(contentInfo.platform, contentInfo.id)
    const platformColor = getPlatformColor(contentInfo.platform)
    
    return {
      type: 'video',
      platform: contentInfo.platform,
      icon: CONTENT_ICONS[contentInfo.platform] || CONTENT_ICONS.video,
      gradient: CONTENT_GRADIENTS.video,
      thumbnailUrl: thumbnailUrl || undefined,
      embedUrl: embedUrl || undefined,
      platformColor,
      isEmbeddable: true,
      label: getPlatformLabel(contentInfo.platform)
    }
  }
  
  // Для документ платформ
  if (contentInfo.type === 'document' && contentInfo.platform) {
    const embedUrl = getEmbedUrl(contentInfo.platform, contentInfo.id || '')
    const platformColor = getPlatformColor(contentInfo.platform)
    
    return {
      type: 'document',
      platform: contentInfo.platform,
      icon: CONTENT_ICONS[contentInfo.platform] || CONTENT_ICONS.document,
      gradient: CONTENT_GRADIENTS.document,
      embedUrl: embedUrl || undefined,
      platformColor,
      isEmbeddable: true,
      label: getPlatformLabel(contentInfo.platform)
    }
  }
  
  // Для аудио платформ
  if (contentInfo.type === 'audio' && contentInfo.platform) {
    const embedUrl = getEmbedUrl(contentInfo.platform, contentInfo.id || '')
    const platformColor = getPlatformColor(contentInfo.platform)
    
    return {
      type: 'audio',
      platform: contentInfo.platform,
      icon: CONTENT_ICONS[contentInfo.platform] || CONTENT_ICONS.audio,
      gradient: CONTENT_GRADIENTS.audio,
      embedUrl: embedUrl || undefined,
      platformColor,
      isEmbeddable: true,
      label: getPlatformLabel(contentInfo.platform)
    }
  }
  
  // Для социальных платформ
  if (contentInfo.type === 'social' && contentInfo.platform) {
    const embedUrl = getEmbedUrl(contentInfo.platform, contentInfo.id || '')
    const platformColor = getPlatformColor(contentInfo.platform)
    
    return {
      type: 'social',
      platform: contentInfo.platform,
      icon: CONTENT_ICONS[contentInfo.platform] || CONTENT_ICONS.social,
      gradient: CONTENT_GRADIENTS.social,
      embedUrl: embedUrl || undefined,
      platformColor,
      isEmbeddable: true,
      label: getPlatformLabel(contentInfo.platform)
    }
  }
  
  // Для прямых ссылок на изображения
  if (contentInfo.type === 'image') {
    return {
      type: 'image',
      icon: CONTENT_ICONS.image,
      gradient: CONTENT_GRADIENTS.image,
      thumbnailUrl: linkUrl,
      isEmbeddable: false,
      label: 'Изображение'
    }
  }
  
  // Fallback для обычных ссылок
  if (ogImage) {
    return {
      type: 'link',
      icon: CONTENT_ICONS.unknown,
      gradient: CONTENT_GRADIENTS.unknown,
      thumbnailUrl: ogImage,
      isEmbeddable: false,
      label: 'Ссылка'
    }
  }
  
  // Последний fallback
  return {
    type: 'unknown',
    icon: CONTENT_ICONS.unknown,
    gradient: CONTENT_GRADIENTS.unknown,
    isEmbeddable: false,
    label: 'Ссылка'
  }
}

/**
 * Генерирует превью для файла
 */
export function generateFilePreview(fileUrl: string, filename?: string): PreviewData {
  const contentInfo = detectContentFromFileExtension(filename || fileUrl)
  
  switch (contentInfo.type) {
    case 'image':
      return {
        type: 'image',
        icon: CONTENT_ICONS.image,
        gradient: CONTENT_GRADIENTS.image,
        thumbnailUrl: fileUrl,
        isEmbeddable: false,
        label: 'Изображение'
      }
      
    case 'video':
      return {
        type: 'video',
        icon: CONTENT_ICONS.video,
        gradient: CONTENT_GRADIENTS.video,
        isEmbeddable: true,
        label: 'Видео'
      }
      
    case 'audio':
      return {
        type: 'audio',
        icon: CONTENT_ICONS.audio,
        gradient: CONTENT_GRADIENTS.audio,
        isEmbeddable: true,
        label: 'Аудио'
      }
      
    case 'document':
      return {
        type: 'document',
        icon: contentInfo.extension === '.pdf' ? CONTENT_ICONS.pdf : CONTENT_ICONS.document,
        gradient: contentInfo.extension === '.pdf' ? CONTENT_GRADIENTS.document : CONTENT_GRADIENTS.document,
        isEmbeddable: true,
        label: getFileLabel(contentInfo.extension || ''),
        extension: contentInfo.extension  // Добавляем extension для определения PDF
      }
      
    case 'presentation':
      return {
        type: 'presentation',
        icon: CONTENT_ICONS.presentation,
        gradient: CONTENT_GRADIENTS.presentation,
        isEmbeddable: true,
        label: 'Презентация'
      }
      
    case 'spreadsheet':
      return {
        type: 'spreadsheet',
        icon: CONTENT_ICONS.spreadsheet,
        gradient: CONTENT_GRADIENTS.spreadsheet,
        isEmbeddable: true,
        label: 'Таблица'
      }
      
    case 'archive':
      return {
        type: 'archive',
        icon: CONTENT_ICONS.archive,
        gradient: CONTENT_GRADIENTS.archive,
        isEmbeddable: false,
        label: 'Архив'
      }
      
    case 'text':
      return {
        type: 'text',
        icon: CONTENT_ICONS.text,
        gradient: CONTENT_GRADIENTS.text,
        isEmbeddable: true,
        label: 'Текст'
      }
      
    default:
      return {
        type: 'unknown',
        icon: CONTENT_ICONS.unknown,
        gradient: CONTENT_GRADIENTS.unknown,
        isEmbeddable: false,
        label: 'Файл'
      }
  }
}

/**
 * Получает человекочитаемое название платформы
 */
function getPlatformLabel(platform: Platform): string {
  const labels: Record<Platform, string> = {
    youtube: 'YouTube',
    vimeo: 'Vimeo',
    dailymotion: 'Dailymotion',
    twitch: 'Twitch',
    'google-docs': 'Google Docs',
    'office-online': 'Office Online',
    notion: 'Notion',
    figma: 'Figma',
    soundcloud: 'SoundCloud',
    spotify: 'Spotify',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    unknown: 'Неизвестно'
  }
  
  return labels[platform] || 'Неизвестно'
}

/**
 * Получает человекочитаемое название файла
 */
function getFileLabel(extension: string): string {
  const labels: Record<string, string> = {
    '.pdf': 'PDF',
    '.doc': 'Word',
    '.docx': 'Word',
    '.ppt': 'PowerPoint',
    '.pptx': 'PowerPoint',
    '.xls': 'Excel',
    '.xlsx': 'Excel',
    '.txt': 'Текст',
    '.rtf': 'RTF',
    '.csv': 'CSV',
    '.json': 'JSON',
    '.xml': 'XML',
    '.md': 'Markdown'
  }
  
  return labels[extension.toLowerCase()] || 'Документ'
}

/**
 * Проверяет, поддерживает ли платформа встраивание
 */
export function isEmbeddable(platform: Platform): boolean {
  const embeddablePlatforms: Platform[] = [
    'youtube', 'vimeo', 'dailymotion', 'twitch',
    'google-docs', 'office-online', 'notion', 'figma',
    'soundcloud', 'spotify',
    'instagram', 'twitter', 'linkedin'
  ]
  
  return embeddablePlatforms.includes(platform)
}

/**
 * Получает рекомендуемый aspect ratio для типа контента
 */
export function getAspectRatio(type: string, platform?: Platform): string {
  if (type === 'video') {
    return 'aspect-video' // 16:9 для всех видео
  }
  
  if (type === 'image') {
    return 'aspect-auto' // Автоматические пропорции для изображений
  }
  
  if (type === 'document' && platform === 'figma') {
    return 'aspect-[16/10]' // Широкий формат для Figma
  }
  
  if (type === 'document' || type === 'presentation' || type === 'spreadsheet') {
    return 'aspect-[4/3]' // 4:3 для документов
  }
  
  if (type === 'audio' || type === 'social') {
    return 'aspect-[16/9]' // 16:9 для аудио и социальных
  }
  
  return 'aspect-[4/3]' // По умолчанию
}

/**
 * Получает динамические стили для превью с учетом пропорций
 */
export function getPreviewStyles(type: string, platform?: Platform): {
  aspectRatio: string
  maxHeight?: string
  objectFit?: string
} {
  const aspectRatio = getAspectRatio(type, platform)
  
  if (type === 'image') {
    return {
      aspectRatio: 'auto',
      maxHeight: '500px', // Ограничиваем высоту для изображений
      objectFit: 'contain'
    }
  }
  
  if (type === 'video') {
    return {
      aspectRatio: '16/9',
      objectFit: 'cover'
    }
  }
  
  return {
    aspectRatio: aspectRatio.replace('aspect-', '').replace(/\[|\]/g, ''),
    objectFit: 'cover'
  }
}
