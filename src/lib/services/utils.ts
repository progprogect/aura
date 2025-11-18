/**
 * Утилиты для работы с услугами и заказами
 */

import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, VALID_STATUS_TRANSITIONS } from './constants'
import type { OrderStatus } from '@/types/service'

/**
 * Генерирует уникальный slug из названия услуги
 */
export function generateServiceSlug(title: string, existingSlugs: string[] = []): string {
  // Транслитерация и очистка
  let slug = title
    .toLowerCase()
    .trim()
    // Кириллица → латиница (упрощенная)
    .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g')
    .replace(/д/g, 'd').replace(/е/g, 'e').replace(/ё/g, 'e').replace(/ж/g, 'zh')
    .replace(/з/g, 'z').replace(/и/g, 'i').replace(/й/g, 'y').replace(/к/g, 'k')
    .replace(/л/g, 'l').replace(/м/g, 'm').replace(/н/g, 'n').replace(/о/g, 'o')
    .replace(/п/g, 'p').replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't')
    .replace(/у/g, 'u').replace(/ф/g, 'f').replace(/х/g, 'h').replace(/ц/g, 'ts')
    .replace(/ч/g, 'ch').replace(/ш/g, 'sh').replace(/щ/g, 'sch').replace(/ъ/g, '')
    .replace(/ы/g, 'y').replace(/ь/g, '').replace(/э/g, 'e').replace(/ю/g, 'yu')
    .replace(/я/g, 'ya')
    // Удаляем спецсимволы, оставляем только буквы, цифры и дефисы
    .replace(/[^a-z0-9\s-]/g, '')
    // Заменяем пробелы на дефисы
    .replace(/\s+/g, '-')
    // Убираем повторяющиеся дефисы
    .replace(/-+/g, '-')
    // Убираем дефисы в начале и конце
    .replace(/^-|-$/g, '')

  // Ограничиваем длину
  slug = slug.substring(0, 60)

  // Проверяем уникальность
  let finalSlug = slug
  let counter = 1
  
  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${slug}-${counter}`
    counter++
  }

  return finalSlug
}

/**
 * Возвращает человекочитаемую метку статуса заказа
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] || status
}

/**
 * Возвращает CSS классы для отображения статуса
 */
export function getOrderStatusColor(status: OrderStatus, type: 'badge' | 'border' | 'bg' = 'badge'): string {
  return ORDER_STATUS_COLORS[status]?.[type] || ORDER_STATUS_COLORS.pending[type]
}

/**
 * Проверяет, можно ли перейти из одного статуса в другой
 */
export function canTransitionStatus(from: OrderStatus, to: OrderStatus): boolean {
  const allowedTransitions = VALID_STATUS_TRANSITIONS[from] || []
  return allowedTransitions.includes(to)
}

/**
 * Форматирует цену для отображения в баллах
 */
export function formatServicePrice(price: number): string {
  // Все услуги отображаются в баллах
  return `${price} баллов`
}

/**
 * Проверяет, просрочен ли заказ
 */
export function isOrderOverdue(deadline: Date | null, status: OrderStatus): boolean {
  if (!deadline || status === 'completed' || status === 'cancelled') {
    return false
  }
  
  return new Date() > new Date(deadline)
}

/**
 * Валидирует список highlights
 */
export function validateHighlights(highlights: string[]): { 
  valid: boolean
  error?: string
  sanitized: string[] 
} {
  if (!Array.isArray(highlights)) {
    return { valid: false, error: 'Highlights должны быть массивом', sanitized: [] }
  }

  if (highlights.length === 0) {
    return { valid: false, error: 'Добавьте хотя бы один пункт "Что входит"', sanitized: [] }
  }

  if (highlights.length > 5) {
    return { valid: false, error: 'Максимум 5 пунктов', sanitized: [] }
  }

  // Очищаем и валидируем каждый пункт
  const sanitized = highlights
    .map(h => h.trim())
    .filter(h => h.length > 0 && h.length <= 100)

  if (sanitized.length === 0) {
    return { valid: false, error: 'Все пункты пустые или слишком длинные', sanitized: [] }
  }

  return { valid: true, sanitized }
}

