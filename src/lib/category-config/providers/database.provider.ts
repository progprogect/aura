// Database Category Provider - читает конфигурацию из БД

import { prisma } from '@/lib/db'
import type { CategoryConfigProvider, CategoryConfig, CategoryField } from '../types'

/**
 * Провайдер конфигурации из базы данных
 * Читает категории и поля из таблиц Category и CategoryField
 */
export class DatabaseCategoryProvider implements CategoryConfigProvider {
  async getCategories(): Promise<CategoryConfig[]> {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        fields: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    return categories.map(this.mapToConfig)
  }

  async getCategoryConfig(categoryKey: string): Promise<CategoryConfig | null> {
    const category = await prisma.category.findUnique({
      where: { key: categoryKey, isActive: true },
      include: {
        fields: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!category) return null
    return this.mapToConfig(category)
  }

  async getCategoryFields(categoryKey: string): Promise<Record<string, CategoryField>> {
    const config = await this.getCategoryConfig(categoryKey)
    return config?.fields || {}
  }

  async hasCategory(categoryKey: string): Promise<boolean> {
    const count = await prisma.category.count({
      where: { key: categoryKey, isActive: true },
    })
    return count > 0
  }

  /**
   * Маппинг модели Prisma в CategoryConfig
   */
  private mapToConfig(category: any): CategoryConfig {
    const fields: Record<string, CategoryField> = {}

    for (const field of category.fields) {
      fields[field.key] = {
        key: field.key,
        label: field.label,
        icon: field.icon,
        type: field.type as CategoryField['type'],
        required: field.required,
        placeholder: field.placeholder || undefined,
        helpText: field.helpText || undefined,
      }
    }

    return {
      key: category.key,
      name: category.name,
      emoji: category.emoji,
      priceLabel: category.priceLabel,
      fields,
    }
  }
}

