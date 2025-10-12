/**
 * Константы для системы лид-магнитов
 * Централизованное хранение всех констант для избежания magic numbers
 */

import type { LeadMagnetType } from '@/types/lead-magnet'

// ========================================
// PREVIEW CONFIGURATION
// ========================================

/**
 * Размеры превью (в пикселях)
 */
export const PREVIEW_SIZES = {
  FALLBACK: 800,        // Квадрат для fallback генерации
  EMOJI_FONT: 240,      // Размер emoji на fallback
  THUMBNAIL: 200,       // Размер thumbnail
  CARD: 400,           // Размер для карточек
  DETAIL: 800          // Размер для детальной страницы
} as const

/**
 * Лимиты файлов превью
 */
export const PREVIEW_FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024,  // 5MB в байтах
  VALID_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  VALID_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const
} as const

/**
 * Gradients для fallback превью
 * Цвета в HEX формате
 */
export const FALLBACK_GRADIENTS: Record<LeadMagnetType, { start: string; end: string }> = {
  file: { start: '#3B82F6', end: '#1E40AF' },      // Синий
  link: { start: '#8B5CF6', end: '#6D28D9' },      // Фиолетовый
  service: { start: '#EC4899', end: '#BE185D' }    // Розовый
} as const

/**
 * Tailwind CSS классы для градиентов
 */
export const FALLBACK_GRADIENT_CLASSES: Record<LeadMagnetType, string> = {
  file: 'from-blue-500 to-blue-700',
  link: 'from-purple-500 to-purple-700',
  service: 'from-pink-500 to-pink-700'
} as const

/**
 * Canvas настройки для fallback
 */
export const CANVAS_CONFIG = {
  SHADOW_COLOR: 'rgba(0, 0, 0, 0.2)',
  SHADOW_BLUR: 20,
  SHADOW_OFFSET_Y: 10,
  EMOJI_OPACITY: 0.95,
  FONT_FAMILY: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif'
} as const

// ========================================
// CLOUDINARY CONFIGURATION
// ========================================

/**
 * Cloudinary папки
 */
export const CLOUDINARY_FOLDERS = {
  CUSTOM_PREVIEWS: 'aura/lead-magnets/custom-previews',
  FALLBACK_PREVIEWS: 'aura/lead-magnets/fallback-previews',
  LEAD_MAGNETS: 'aura/lead-magnets'
} as const

/**
 * Cloudinary трансформации
 */
export const CLOUDINARY_TRANSFORMATIONS = {
  THUMBNAIL: { width: 200, height: 200, crop: 'fill', quality: 80 },
  CARD: { width: 400, height: 400, crop: 'fill', quality: 85 },
  DETAIL: { width: 800, height: 800, crop: 'fill', quality: 90 }
} as const

// ========================================
// LEAD MAGNET LIMITS
// ========================================

/**
 * Лимиты лид-магнитов
 */
export const LEAD_MAGNET_LIMITS = {
  MAX_COUNT: 6,              // Максимум лид-магнитов на специалиста
  MAX_HIGHLIGHTS: 5,         // Максимум пунктов "что внутри"
  MAX_FILE_SIZE: 10 * 1024 * 1024,  // 10MB для файлов лид-магнитов
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 200,
  TARGET_AUDIENCE_MAX_LENGTH: 50
} as const

// ========================================
// UI CONFIGURATION
// ========================================

/**
 * Breakpoints для responsive grid
 */
export const GRID_BREAKPOINTS = {
  MOBILE: 1,    // 1 колонка на мобильных
  TABLET: 2,    // 2 колонки на планшетах
  DESKTOP: 3    // 3 колонки на десктопе
} as const

/**
 * Aspect ratio для превью
 */
export const ASPECT_RATIO = '1/1' as const  // Квадрат

/**
 * Emoji defaults
 */
export const DEFAULT_EMOJI = '🎁' as const

