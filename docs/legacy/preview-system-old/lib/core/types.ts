/**
 * TypeScript типы для preview системы
 * Единый источник правды для всех модулей
 */

import type { LeadMagnet } from '@/types/lead-magnet'

/**
 * Результат генерации превью
 */
export interface PreviewGenerationResult {
  success: boolean
  previewBuffer?: Buffer
  previewUrls?: ResponsivePreviewUrls  // Для Cloudinary трансформаций (PDF, etc)
  previewType?: 'image' | 'video-thumbnail' | 'pdf' | 'service-card' | 'og-image'
  error?: string
  metadata?: {
    width?: number
    height?: number
    format?: string
    size?: number
  }
}

/**
 * Настройки генерации превью
 */
export interface PreviewGenerationOptions {
  type: 'file' | 'link' | 'service'
  fileUrl?: string | null
  linkUrl?: string | null
  ogImage?: string | null
  title: string
  description: string
  emoji: string
  highlights?: string[]
  
  // Настройки качества и размера
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Responsive URLs для превью
 */
export interface ResponsivePreviewUrls {
  thumbnail: string  // 400x300
  card: string       // 800x600
  detail: string     // 1200x900
  original?: string
}

/**
 * Метаданные превью в БД
 */
export interface PreviewMetadata {
  urls: ResponsivePreviewUrls
  generatedAt: Date
  type: string
  size?: number
}

/**
 * Базовый интерфейс для всех provider
 */
export interface PreviewProvider {
  /**
   * Имя provider
   */
  name: string

  /**
   * Может ли provider обработать данный тип контента
   */
  canHandle(options: PreviewGenerationOptions): boolean

  /**
   * Сгенерировать превью
   */
  generate(options: PreviewGenerationOptions): Promise<PreviewGenerationResult>
}

/**
 * Конфигурация для оптимизатора изображений
 */
export interface ImageOptimizationConfig {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'png' | 'jpeg' | 'avif'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

/**
 * Результат оптимизации изображения
 */
export interface OptimizedImageResult {
  buffer: Buffer
  format: string
  width: number
  height: number
  size: number
}

/**
 * Информация о типе контента
 */
export interface ContentInfo {
  type: 'video' | 'document' | 'image' | 'audio' | 'service' | 'unknown'
  platform?: string
  id?: string
  extension?: string
  mimeType?: string
  isEmbeddable: boolean
}

/**
 * Настройки для хранилища
 */
export interface StorageConfig {
  provider: 'cloudinary' | 'local' | 's3'
  folder?: string
  publicId?: string
}

/**
 * Результат загрузки в хранилище
 */
export interface StorageUploadResult {
  urls: ResponsivePreviewUrls
  publicId: string
  provider: string
}

