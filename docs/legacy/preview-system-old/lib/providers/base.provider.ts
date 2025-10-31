/**
 * Базовый абстрактный класс для всех preview providers
 */

import type { PreviewProvider, PreviewGenerationOptions, PreviewGenerationResult } from '../core/types'

export abstract class BasePreviewProvider implements PreviewProvider {
  abstract name: string

  /**
   * Определяет, может ли provider обработать данный контент
   */
  abstract canHandle(options: PreviewGenerationOptions): boolean

  /**
   * Генерирует превью
   */
  abstract generate(options: PreviewGenerationOptions): Promise<PreviewGenerationResult>

  /**
   * Обработка ошибок с логированием
   */
  protected handleError(error: unknown, context: string): PreviewGenerationResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[${this.name}] ${context}:`, error)
    
    return {
      success: false,
      error: errorMessage
    }
  }

  /**
   * Успешный результат
   */
  protected successResult(
    buffer: Buffer,
    type: PreviewGenerationResult['previewType'],
    metadata?: PreviewGenerationResult['metadata']
  ): PreviewGenerationResult {
    return {
      success: true,
      previewBuffer: buffer,
      previewType: type,
      metadata
    }
  }

  /**
   * Результат с ошибкой
   */
  protected errorResult(error: string): PreviewGenerationResult {
    return {
      success: false,
      error
    }
  }
}

