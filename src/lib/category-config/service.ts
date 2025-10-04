// Category Config Service - высокоуровневый API для работы с категориями

import { createCategoryProvider } from './factory'
import type { CategoryConfigProvider, CategoryConfig, CategoryField } from './types'

/**
 * Сервис для работы с конфигурацией категорий
 * Использует DatabaseCategoryProvider с кешированием
 */
class CategoryConfigService {
  private provider: CategoryConfigProvider

  constructor(provider?: CategoryConfigProvider) {
    // По умолчанию создаем Database provider с кешем
    this.provider = provider || createCategoryProvider()
  }

  /**
   * Получить все активные категории
   */
  async getCategories(): Promise<CategoryConfig[]> {
    try {
      return await this.provider.getCategories()
    } catch (error) {
      console.error('Error getting categories:', error)
      return []
    }
  }

  /**
   * Получить конфигурацию категории
   * @throws Error если категория не найдена
   */
  async getCategoryConfig(categoryKey: string): Promise<CategoryConfig> {
    const config = await this.provider.getCategoryConfig(categoryKey)
    if (!config) {
      throw new Error(`Category "${categoryKey}" not found`)
    }
    return config
  }

  /**
   * Получить конфигурацию категории (безопасная версия)
   * Возвращает null вместо выброса ошибки
   */
  async getCategoryConfigSafe(categoryKey: string): Promise<CategoryConfig | null> {
    try {
      return await this.provider.getCategoryConfig(categoryKey)
    } catch (error) {
      console.error(`Error getting category config for ${categoryKey}:`, error)
      return null
    }
  }

  /**
   * Получить поля категории
   */
  async getCategoryFields(categoryKey: string): Promise<Record<string, CategoryField>> {
    try {
      return await this.provider.getCategoryFields(categoryKey)
    } catch (error) {
      console.error(`Error getting fields for category ${categoryKey}:`, error)
      return {}
    }
  }

  /**
   * Проверить существование категории
   */
  async validateCategory(categoryKey: string): Promise<boolean> {
    try {
      return await this.provider.hasCategory(categoryKey)
    } catch (error) {
      console.error(`Error validating category ${categoryKey}:`, error)
      return false
    }
  }

  /**
   * Получить название категории
   */
  async getCategoryName(categoryKey: string): Promise<string> {
    const config = await this.getCategoryConfigSafe(categoryKey)
    return config?.name || categoryKey
  }

  /**
   * Получить emoji категории
   */
  async getCategoryEmoji(categoryKey: string): Promise<string> {
    const config = await this.getCategoryConfigSafe(categoryKey)
    return config?.emoji || '✨'
  }

  /**
   * Получить метку цены для категории
   */
  async getPriceLabel(categoryKey: string): Promise<string> {
    const config = await this.getCategoryConfigSafe(categoryKey)
    return config?.priceLabel || 'за услугу'
  }

  /**
   * Получить список ключей всех категорий
   */
  async getCategoryKeys(): Promise<string[]> {
    const categories = await this.getCategories()
    return categories.map(cat => cat.key)
  }
}

// Singleton instance
export const categoryConfigService = new CategoryConfigService()

// Также экспортируем класс для создания кастомных инстансов
export { CategoryConfigService }
