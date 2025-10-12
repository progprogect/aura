/**
 * Preview System - Утилиты для отображения превью
 * Экспортируем только утилиты (генераторы удалены)
 */

// Utils - константы и хелперы для отображения
export {
  CONTENT_GRADIENTS,
  CONTENT_ICONS,
  FILE_EXTENSIONS,
  PREVIEW_SIZES,
  ASPECT_RATIOS
} from './utils/constants'

export {
  getContentGradient,
  getContentIcon,
  getFileExtension,
  getFileTypeByExtension,
  isImageUrl,
  isPDFUrl,
  formatFileSize,
  generateSrcSet,
  generateSizes,
  extractYouTubeVideoId,
  getYouTubeThumbnail,
  isYouTubeUrl,
  isVimeoUrl,
  getLeadMagnetBadgeColor,
  getLeadMagnetPreviewData
} from './utils/helpers'

export {
  parsePreviewUrls,
  getPreviewUrl
} from './utils/parse-preview-urls'
