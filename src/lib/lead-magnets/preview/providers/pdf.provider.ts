/**
 * PDF Preview Provider
 * Использует Cloudinary трансформации для генерации превью PDF
 * БЕЗ canvas! 100% надежность!
 */

import { BasePreviewProvider } from './base.provider'
import type { PreviewGenerationOptions, PreviewGenerationResult } from '../core/types'
import { generatePDFPreviewUrls } from '@/lib/cloudinary/config'

function isPDFUrl(url: string): boolean {
  return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?')
}

function isCloudinaryPDF(url: string): boolean {
  return url.includes('res.cloudinary.com') && url.includes('/raw/upload/')
}

export class PDFPreviewProvider extends BasePreviewProvider {
  name = 'PDFPreviewProvider'

  canHandle(options: PreviewGenerationOptions): boolean {
    if (options.type !== 'file' || !options.fileUrl) {
      return false
    }

    // Работаем только с PDF из Cloudinary
    return isPDFUrl(options.fileUrl) && isCloudinaryPDF(options.fileUrl)
  }

  async generate(options: PreviewGenerationOptions): Promise<PreviewGenerationResult> {
    if (!options.fileUrl) {
      return this.errorResult('PDF URL is required')
    }

    try {
      console.log(`[${this.name}] 🎨 Генерация PDF preview через Cloudinary трансформации`)
      console.log(`[${this.name}]   PDF: ${options.title}`)

      // Генерируем preview URLs через Cloudinary трансформации
      // Cloudinary автоматически конвертирует первую страницу PDF в JPG!
      const previewUrls = generatePDFPreviewUrls(options.fileUrl)

      console.log(`[${this.name}] ✅ PDF preview URLs сгенерированы:`)
      console.log(`[${this.name}]   - Thumbnail: ${previewUrls.thumbnail}`)
      console.log(`[${this.name}]   - Card: ${previewUrls.card}`)
      console.log(`[${this.name}]   - Detail: ${previewUrls.detail}`)

      // Возвращаем результат БЕЗ buffer (используем прямые URL)
      return {
        success: true,
        previewBuffer: undefined, // Не нужен buffer - у нас уже есть URL!
        previewUrls, // Cloudinary трансформации
        metadata: {
          format: 'jpg',
          size: 0
        }
      }
    } catch (error) {
      return this.handleError(error, 'PDF preview generation failed')
    }
  }
}

