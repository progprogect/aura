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

    // Проверяем конфигурацию Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary не настроен. Загрузка файлов недоступна.')
    }

    // Конвертируем File в base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Загружаем через Cloudinary напрямую
    const formData = new FormData()
    formData.append('file', base64)
    formData.append('api_key', apiKey)
    formData.append('timestamp', Math.round(Date.now() / 1000).toString())
    
    if (options.folder) {
      formData.append('folder', options.folder)
    }
    
    // Генерируем подпись для подписанной загрузки
    const timestamp = Math.round(Date.now() / 1000)
    const folderParam = options.folder ? `folder=${options.folder}&` : ''
    const params = `${folderParam}timestamp=${timestamp}${apiSecret}`
    const signature = require('crypto').createHash('sha1').update(params).digest('hex')
    formData.append('signature', signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Ошибка загрузки файла в Cloudinary')
    }

    const result = await response.json()
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      size: file.size,
      format: file.type
    }
  }

  /**
   * Загружает скриншот результата работы
   */
  static async uploadResultScreenshot(file: File): Promise<string> {
    // Валидируем файл
    const validation = this.validateFile(file, {
      maxSize: 3 * 1024 * 1024, // 3MB для скриншотов
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    })
    
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Проверяем конфигурацию Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary не настроен. Загрузка файлов недоступна.')
    }

    // Конвертируем File в base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Загружаем через Cloudinary с подписанной загрузкой
    const formData = new FormData()
    formData.append('file', base64)
    formData.append('api_key', apiKey)
    formData.append('timestamp', Math.round(Date.now() / 1000).toString())
    formData.append('folder', 'aura/order-results')
    
    // Генерируем подпись для подписанной загрузки
    const timestamp = Math.round(Date.now() / 1000)
    const params = `folder=aura/order-results&timestamp=${timestamp}${apiSecret}`
    const signature = require('crypto').createHash('sha1').update(params).digest('hex')
    formData.append('signature', signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Ошибка загрузки файла в Cloudinary')
    }

    const result = await response.json()
    return result.secure_url
  }
}
