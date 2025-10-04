// Упрощенная фабрика провайдеров - только Database + Cache

import { DatabaseCategoryProvider } from './providers/database.provider'
import { CachedCategoryProvider } from './providers/cached.provider'
import type { CategoryConfigProvider } from './types'

/**
 * Создает провайдер конфигурации категорий
 * Всегда использует DatabaseCategoryProvider с кешированием
 * 
 * @param cacheTtl - TTL кеша в миллисекундах (по умолчанию 5 минут)
 * @returns настроенный провайдер с кешем
 */
export function createCategoryProvider(
  cacheTtl = 5 * 60 * 1000
): CategoryConfigProvider {
  // Создаем провайдер из БД
  const databaseProvider = new DatabaseCategoryProvider()

  // Оборачиваем в кеш для производительности
  return new CachedCategoryProvider(databaseProvider, cacheTtl)
}
