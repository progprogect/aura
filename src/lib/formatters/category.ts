/**
 * Форматирование и работа с категориями
 */

import { CategoryConfig, CategoryMap } from '@/lib/catalog/types'

/**
 * Получение названия категории
 * @param key - Ключ категории
 * @param categories - Map категорий или массив
 * @returns Название категории или ключ если не найдена
 * 
 * @example
 * getCategoryLabel('psychology', categoriesMap) // "Психология и терапия"
 */
export function getCategoryLabel(
  key: string,
  categories: CategoryMap | CategoryConfig[]
): string {
  if (categories instanceof Map) {
    return categories.get(key)?.name || key
  }
  
  const category = categories.find((c) => c.key === key)
  return category?.name || key
}

/**
 * Получение эмодзи категории
 * @param key - Ключ категории
 * @param categories - Map категорий или массив
 * @returns Эмодзи категории или дефолтное
 * 
 * @example
 * getCategoryEmoji('psychology', categoriesMap) // "🧠"
 */
export function getCategoryEmoji(
  key: string,
  categories: CategoryMap | CategoryConfig[]
): string {
  if (categories instanceof Map) {
    return categories.get(key)?.emoji || '👨‍⚕️'
  }
  
  const category = categories.find((c) => c.key === key)
  return category?.emoji || '👨‍⚕️'
}

/**
 * Получение цвета категории для UI (градиенты)
 * @param key - Ключ категории
 * @returns Tailwind классы для градиента
 * 
 * @example
 * getCategoryColor('psychology') // "from-purple-50 to-blue-100"
 */
export function getCategoryColor(key: string): string {
  const colorMap: Record<string, string> = {
    psychology: 'from-purple-50 to-blue-100',
    fitness: 'from-orange-50 to-red-100',
    nutrition: 'from-green-50 to-emerald-100',
    massage: 'from-pink-50 to-rose-100',
    wellness: 'from-cyan-50 to-teal-100',
    coaching: 'from-indigo-50 to-violet-100',
    medicine: 'from-blue-50 to-sky-100',
    other: 'from-gray-50 to-slate-100',
  }
  
  return colorMap[key] || colorMap.other
}

/**
 * Создание Map из массива категорий для быстрого доступа
 * @param categories - Массив категорий
 * @returns Map с ключом category.key
 */
export function createCategoryMap(categories: CategoryConfig[]): CategoryMap {
  return new Map(categories.map((cat) => [cat.key, cat]))
}

/**
 * Получение активных категорий
 * @param categories - Массив категорий
 * @returns Только активные категории, отсортированные по order
 */
export function getActiveCategories(
  categories: CategoryConfig[]
): CategoryConfig[] {
  return categories
    .filter((cat) => cat.isActive)
    .sort((a, b) => a.order - b.order)
}

/**
 * Форматирование ключа категории в читаемое название (fallback)
 * @param key - Ключ категории
 * @returns Читаемое название
 * 
 * @example
 * formatCategoryKey('psychology') // "Психология"
 * formatCategoryKey('fitness') // "Фитнес"
 */
export function formatCategoryKey(key: string): string {
  const namesMap: Record<string, string> = {
    psychology: 'Психология',
    fitness: 'Фитнес',
    nutrition: 'Питание',
    massage: 'Массаж',
    wellness: 'Велнес',
    coaching: 'Коучинг',
    medicine: 'Медицина',
    other: 'Другое',
  }
  
  return namesMap[key] || key
}

