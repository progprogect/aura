/**
 * Константы для preview системы
 * Объединённые из preview.ts и preview-generator.ts
 */

// Градиенты для разных типов контента (СВЕТЛЫЕ ПАСТЕЛЬНЫЕ)
export const CONTENT_GRADIENTS = {
  video: 'from-red-300 to-orange-300',
  document: 'from-blue-300 to-cyan-300',
  image: 'from-green-300 to-emerald-300',
  audio: 'from-purple-300 to-pink-300',
  archive: 'from-orange-300 to-amber-300',
  text: 'from-gray-300 to-slate-300',
  presentation: 'from-yellow-300 to-orange-300',
  spreadsheet: 'from-emerald-300 to-teal-300',
  social: 'from-pink-300 to-rose-300',
  service: 'from-indigo-300 to-blue-300',
  unknown: 'from-slate-300 to-gray-300'
} as const

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
  pdf: '📕',
  
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
  
  // Сервисы
  service: '💼',
  
  // Fallback
  unknown: '📎'
} as const

// Типы файлов по расширениям
export const FILE_EXTENSIONS = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff'],
  video: ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v'],
  audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
  document: ['.pdf', '.doc', '.docx', '.rtf', '.txt'],
  presentation: ['.ppt', '.pptx', '.odp'],
  spreadsheet: ['.xls', '.xlsx', '.csv', '.ods'],
  archive: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
  text: ['.txt', '.rtf', '.json', '.xml', '.md', '.log']
} as const

// Размеры для responsive images
export const PREVIEW_SIZES = {
  thumbnail: { width: 400, height: 300, quality: 80 },
  card: { width: 800, height: 600, quality: 85 },
  detail: { width: 1200, height: 900, quality: 90 },
} as const

// Aspect ratios для разных типов
export const ASPECT_RATIOS = {
  video: 'aspect-video', // 16:9
  image: 'aspect-auto',
  document: 'aspect-[4/3]',
  presentation: 'aspect-[4/3]',
  audio: 'aspect-[16/9]',
  social: 'aspect-[16/9]',
  default: 'aspect-[4/3]'
} as const

