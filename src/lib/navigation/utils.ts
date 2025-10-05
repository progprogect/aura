/**
 * Утилиты для навигации
 */

// ========================================
// ПАРСИНГ RETURN URL
// ========================================

/**
 * Парсинг returnUrl для определения контекста
 */
export function parseReturnUrl(returnUrl: string | null): {
  hasContext: boolean
  category: string | null
} {
  if (!returnUrl) {
    return { hasContext: false, category: null }
  }

  try {
    const url = new URL(returnUrl, 'http://localhost')
    const category = url.searchParams.get('category')

    return {
      hasContext: true,
      category: category && category !== 'all' ? category : null,
    }
  } catch {
    return { hasContext: false, category: null }
  }
}

// ========================================
// ФОРМАТИРОВАНИЕ LABELS
// ========================================

/**
 * Получение label для каталога (для FAB и breadcrumbs)
 * @param category - Ключ категории или null
 * @returns Простой label ("Психология" или "Каталог")
 */
export function getCatalogLabel(category: string | null): string {
  if (!category) return 'Каталог'

  // Простой mapping категорий
  const labels: Record<string, string> = {
    psychology: 'Психология',
    fitness: 'Фитнес',
    nutrition: 'Питание',
    massage: 'Массаж',
    wellness: 'Велнес',
    coaching: 'Коучинг',
    medicine: 'Медицина',
    other: 'Другое',
  }

  return labels[category] || 'Каталог'
}

