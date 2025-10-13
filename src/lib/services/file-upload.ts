/**
 * Централизованный сервис для загрузки файлов
 */

import { NextRequest } from 'next/server'

export interface FileUploadOptions {
  maxSize?: number // в байтах
  allowedTypes?: string[]
  folder?: string
}

export interface UploadResult {
  url: string
  publicId?: string
  size: number
  format: string
}

export class FileUploadService {
  private static readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  /**
   * Валидирует файл перед загрузкой
   */
  static validateFile(file: File, options: FileUploadOptions = {}): { valid: boolean; error?: string } {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE
    const allowedTypes = options.allowedTypes || this.DEFAULT_ALLOWED_TYPES

    // Проверяем размер
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Файл слишком большой. Максимальный размер: ${Math.round(maxSize / 1024 / 1024)}MB`
      }
    }

    // Проверяем тип
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Неподдерживаемый тип файла. Разрешены: ${allowedTypes.join(', ')}`
      }
    }

    return { valid: true }
  }

  /**
   * Загружает файл в Cloudinary
   */
  static async uploadToCloudinary(
    file: File, 
    options: FileUploadOptions = {}
  ): Promise<UploadResult> {
    // Валидируем файл
    const validation = this.validateFile(file, options)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const formData = new FormData()
    formData.append('file', file)
    
    if (options.folder) {
      formData.append('folder', options.folder)
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Ошибка загрузки файла')
    }
    
    const result = await response.json()
    
    return {
      url: result.url,
      publicId: result.publicId,
      size: file.size,
      format: file.type
    }
  }

  /**
   * Загружает скриншот результата работы
   */
  static async uploadResultScreenshot(file: File): Promise<string> {
    const result = await this.uploadToCloudinary(file, {
      folder: 'order-results',
      maxSize: 3 * 1024 * 1024, // 3MB для скриншотов
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    })
    
    return result.url
  }
}
