/**
 * Preview System - Центральная точка экспорта
 * Clean Architecture для генерации и управления превью лид-магнитов
 */

// Core
export { 
  generatePreview, 
  shouldGeneratePreview, 
  previewGenerator 
} from './core/generator'
export type {
  PreviewGenerationOptions,
  PreviewGenerationResult,
  PreviewProvider,
  ResponsivePreviewUrls,
  PreviewMetadata,
  ContentInfo,
  ImageOptimizationConfig,
  OptimizedImageResult,
  StorageUploadResult
} from './core/types'

// Providers
export { PDFPreviewProvider } from './providers/pdf.provider'
export { ImagePreviewProvider } from './providers/image.provider'
export { VideoPreviewProvider } from './providers/video.provider'
export { ServicePreviewProvider } from './providers/service.provider'
export { BasePreviewProvider } from './providers/base.provider'

// Storage
export {
  uploadPreviewToCloudinary,
  deletePreviewFromCloudinary,
  isCloudinaryAvailable
} from './storage/cloudinary.storage'

// Utils
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
  isVimeoUrl
} from './utils/helpers'

