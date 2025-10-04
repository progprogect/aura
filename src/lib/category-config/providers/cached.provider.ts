// Cached Category Provider - обертка с кешированием

import type { CategoryConfigProvider, CategoryConfig, CategoryField } from '../types'

/**
 * Провайдер с кешированием
 * Обертка над любым провайдером, добавляет in-memory кеш с TTL
 */
export class CachedCategoryProvider implements CategoryConfigProvider {
  private cache = new Map<string, { data: CategoryConfig; expires: number }>()
  private categoriesCache: { data: CategoryConfig[]; expires: number } | null = null
  private ttl: number

  constructor(
    private provider: CategoryConfigProvider,
    ttlMs: number = 5 * 60 * 1000 // 5 минут по умолчанию
  ) {
    this.ttl = ttlMs
  }

  async getCategories(): Promise<CategoryConfig[]> {
    // Проверяем кеш
    if (this.categoriesCache && this.categoriesCache.expires > Date.now()) {
      return this.categoriesCache.data
    }

    // Запрашиваем данные
    const categories = await this.provider.getCategories()

    // Кешируем
    this.categoriesCache = {
      data: categories,
      expires: Date.now() + this.ttl,
    }

    return categories
  }

  async getCategoryConfig(categoryKey: string): Promise<CategoryConfig | null> {
    // Проверяем кеш
    const cached = this.cache.get(categoryKey)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }

    // Запрашиваем данные
    const config = await this.provider.getCategoryConfig(categoryKey)

    // Кешируем если нашли
    if (config) {
      this.cache.set(categoryKey, {
        data: config,
        expires: Date.now() + this.ttl,
      })
    }

    return config
  }

  async getCategoryFields(categoryKey: string): Promise<Record<string, CategoryField>> {
    const config = await this.getCategoryConfig(categoryKey)
    return config?.fields || {}
  }

  async hasCategory(categoryKey: string): Promise<boolean> {
    // Для проверки существования не кешируем
    return this.provider.hasCategory(categoryKey)
  }

  /**
   * Очистить весь кеш
   */
  clearCache(): void {
    this.cache.clear()
    this.categoriesCache = null
  }

  /**
   * Очистить кеш конкретной категории
   */
  clearCategory(categoryKey: string): void {
    this.cache.delete(categoryKey)
  }

  /**
   * Очистить кеш списка категорий
   */
  clearCategoriesCache(): void {
    this.categoriesCache = null
  }
}

