/**
 * Типы для навигационной системы
 */

// ========================================
// СОСТОЯНИЕ КАТАЛОГА
// ========================================

/**
 * Состояние каталога, сохраняемое в localStorage
 */
export interface CatalogState {
  /** Полный route для проверки совпадения */
  route: string
  
  /** Позиция скролла */
  scrollPosition: number
  
  /** Label категории для отображения ("Психология") */
  categoryLabel: string
  
  /** Timestamp для TTL */
  timestamp: number
}

// ========================================
// BREADCRUMBS
// ========================================

/**
 * Элемент breadcrumb навигации
 */
export interface BreadcrumbItem {
  /** Текст для отображения */
  label: string
  
  /** Ссылка (если кликабельная) */
  href?: string
  
  /** Активный элемент (текущая страница) */
  isActive?: boolean
}

// ========================================
// FAB (FLOATING ACTION BUTTON)
// ========================================

/**
 * Состояние Floating Back Button
 */
export interface FABState {
  /** Показывать ли кнопку */
  show: boolean
  
  /** URL для возврата */
  returnUrl: string
  
  /** Label для aria-label */
  label: string
}

