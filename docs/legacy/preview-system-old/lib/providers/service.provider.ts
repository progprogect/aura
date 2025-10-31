/**
 * Service Preview Provider
 * Генерация визуальных карточек для сервисов
 */

import { BasePreviewProvider } from './base.provider'
import type { PreviewGenerationOptions, PreviewGenerationResult } from '../core/types'
import { generateServiceCardPreview } from '../../service-card-generator'

export class ServicePreviewProvider extends BasePreviewProvider {
  name = 'ServicePreviewProvider'

  canHandle(options: PreviewGenerationOptions): boolean {
    return options.type === 'service'
  }

  async generate(options: PreviewGenerationOptions): Promise<PreviewGenerationResult> {
    try {
      console.log(`[${this.name}] Генерация карточки сервиса: ${options.title}`)

      const buffer = await generateServiceCardPreview({
        title: options.title,
        description: options.description,
        emoji: options.emoji,
        highlights: options.highlights || []
      })

      console.log(`[${this.name}] ✅ Карточка сервиса сгенерирована`)

      return this.successResult(buffer, 'service-card', {
        format: 'webp',
        size: buffer.length
      })
    } catch (error) {
      return this.handleError(error, 'Service card generation failed')
    }
  }
}

