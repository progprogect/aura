/**
 * Центральный генератор превью
 * Единая точка входа для генерации превью всех типов
 */

import type { PreviewGenerationOptions, PreviewGenerationResult, PreviewProvider } from './types'
import { PDFPreviewProvider } from '../providers/pdf.provider'
import { ImagePreviewProvider } from '../providers/image.provider'
import { VideoPreviewProvider } from '../providers/video.provider'
import { ServicePreviewProvider } from '../providers/service.provider'

/**
 * Менеджер провайдеров превью
 */
class PreviewGeneratorManager {
  private providers: PreviewProvider[] = []

  constructor() {
    // Регистрируем все providers в порядке приоритета
    this.registerProvider(new PDFPreviewProvider())
    this.registerProvider(new ImagePreviewProvider())
    this.registerProvider(new VideoPreviewProvider())
    this.registerProvider(new ServicePreviewProvider())
  }

  /**
   * Регистрация нового provider
   */
  registerProvider(provider: PreviewProvider): void {
    this.providers.push(provider)
    console.log(`[Preview Generator] Зарегистрирован provider: ${provider.name}`)
  }

  /**
   * Найти подходящий provider
   */
  findProvider(options: PreviewGenerationOptions): PreviewProvider | null {
    return this.providers.find(provider => provider.canHandle(options)) || null
  }

  /**
   * Генерация превью
   */
  async generate(options: PreviewGenerationOptions): Promise<PreviewGenerationResult> {
    console.log(`[Preview Generator] Генерация превью для: ${options.title} (тип: ${options.type})`)

    const provider = this.findProvider(options)

    if (!provider) {
      console.warn(`[Preview Generator] Не найден provider для типа: ${options.type}`)
      return {
        success: false,
        error: `No provider found for type: ${options.type}`
      }
    }

    console.log(`[Preview Generator] Используется provider: ${provider.name}`)

    try {
      const result = await provider.generate(options)
      
      if (result.success) {
        console.log(`[Preview Generator] ✅ Превью успешно сгенерировано (${result.previewType})`)
      } else {
        console.error(`[Preview Generator] ❌ Ошибка генерации: ${result.error}`)
      }

      return result
    } catch (error) {
      console.error('[Preview Generator] ❌ Критическая ошибка:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Определить нужно ли генерировать превью
   */
  shouldGeneratePreview(options: PreviewGenerationOptions): boolean {
    const provider = this.findProvider(options)
    return provider !== null
  }
}

// Singleton instance
const previewGenerator = new PreviewGeneratorManager()

/**
 * Главная функция генерации превью (API)
 */
export async function generatePreview(
  options: PreviewGenerationOptions
): Promise<PreviewGenerationResult> {
  return previewGenerator.generate(options)
}

/**
 * Проверка необходимости генерации превью
 */
export function shouldGeneratePreview(
  options: PreviewGenerationOptions
): boolean {
  // Для сервисов НЕ генерируем превью - показываем форму заявки
  if (options.type === 'service') {
    return false
  }
  
  return previewGenerator.shouldGeneratePreview(options)
}

/**
 * Экспорт manager для расширенного использования
 */
export { previewGenerator }

