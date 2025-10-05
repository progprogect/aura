/**
 * Сохранение и восстановление позиции скролла каталога
 * Использует localStorage для мгновенного восстановления
 */

import { CatalogState } from './types'

// ========================================
// КОНСТАНТЫ
// ========================================

const STORAGE_KEY = 'aura-catalog-state'
const TTL = 60 * 60 * 1000 // 1 час

// ========================================
// УТИЛИТЫ
// ========================================

/**
 * Проверка доступности localStorage
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// ========================================
// СОХРАНЕНИЕ
// ========================================

/**
 * Сохранение состояния каталога в localStorage
 * 
 * @param route - Полный URL каталога
 * @param scrollPosition - Позиция скролла
 * @param categoryLabel - Label категории для отображения
 */
export function saveCatalogState(
  route: string,
  scrollPosition: number,
  categoryLabel: string
): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage недоступен')
    return
  }

  try {
    const state: CatalogState = {
      route,
      scrollPosition,
      categoryLabel,
      timestamp: Date.now(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to save catalog state:', error)
  }
}

// ========================================
// ВОССТАНОВЛЕНИЕ
// ========================================

/**
 * Восстановление состояния каталога из localStorage
 * 
 * @param expectedRoute - Текущий route для проверки совпадения
 * @returns Сохранённое состояние или null
 */
export function restoreCatalogState(
  expectedRoute: string
): CatalogState | null {
  if (!isLocalStorageAvailable()) {
    return null
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null

    const state: CatalogState = JSON.parse(saved)

    // Проверяем TTL
    if (Date.now() - state.timestamp > TTL) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    // Проверяем что route совпадает
    if (state.route !== expectedRoute) {
      return null
    }

    return state
  } catch (error) {
    console.warn('Failed to restore catalog state:', error)
    return null
  }
}

// ========================================
// ОЧИСТКА
// ========================================

/**
 * Очистка сохранённого состояния
 * Вызывается после восстановления scroll
 */
export function clearCatalogState(): void {
  if (!isLocalStorageAvailable()) {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear catalog state:', error)
  }
}

