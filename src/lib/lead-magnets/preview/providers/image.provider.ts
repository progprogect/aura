/**
 * Image Preview Provider
 * Обработка изображений (оптимизация и resize)
 */

import { BasePreviewProvider } from './base.provider'
import type { PreviewGenerationOptions, PreviewGenerationResult } from '../core/types'
import { generateCardPreview } from '../../image-optimizer'

export class ImagePreviewProvider extends BasePreviewProvider {
  name = 'ImagePreviewProvider'

  canHandle(options: PreviewGenerationOptions): boolean {
    if (options.type === 'file' && options.fileUrl) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
      return imageExtensions.some(ext => options.fileUrl!.toLowerCase().endsWith(ext))
    }

    return false
  }

  async generate(options: PreviewGenerationOptions): Promise<PreviewGenerationResult> {
    if (!options.fileUrl) {
      return this.errorResult('Image URL is required')
    }

    try {
      console.log(`[${this.name}] Оптимизация изображения: ${options.title}`)

      const buffer = await generateCardPreview(options.fileUrl)

      console.log(`[${this.name}] ✅ Изображение оптимизировано`)

      return this.successResult(buffer, 'image', {
        format: 'webp',
        size: buffer.length
      })
    } catch (error) {
      return this.handleError(error, 'Image optimization failed')
    }
  }
}

