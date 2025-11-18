/**
 * Единый форматтер для отображения баллов в UI
 * Заменяет все старые formatPrice/formatPriceRange
 */

import { formatPoints } from '@/lib/points/format'

/**
 * Форматирует количество баллов для отображения
 * @param amount - Количество баллов (число, строка или Decimal)
 * @returns Отформатированная строка с баллами
 * 
 * @example
 * formatPointsDisplay(100) // "100"
 * formatPointsDisplay(100.5) // "100.5"
 * formatPointsDisplay(1000) // "1000"
 */
export function formatPointsDisplay(amount: number | string | any): string {
  return formatPoints(amount)
}

/**
 * Форматирует диапазон цен в баллах
 * @param from - Цена от (в баллах)
 * @param to - Цена до (в баллах), опционально
 * @returns Отформатированная строка с диапазоном или null
 * 
 * @example
 * formatPointsRange(100) // "100 баллов"
 * formatPointsRange(100, 200) // "100 - 200 баллов"
 * formatPointsRange(100, 100) // "100 баллов"
 */
export function formatPointsRange(
  from: number | null,
  to: number | null = null
): string | null {
  if (!from && !to) return null
  
  const fromFormatted = from ? formatPoints(from) : null
  const toFormatted = to ? formatPoints(to) : null
  
  if (!fromFormatted && !toFormatted) return null
  
  // Если только одна цена
  if (!toFormatted || to === from) {
    return `${fromFormatted} баллов`
  }
  
  // Диапазон цен
  return `${fromFormatted} - ${toFormatted} баллов`
}

/**
 * Форматирует цену с описанием
 * @param amount - Количество баллов
 * @param description - Описание (например, "за сессию")
 * @returns Отформатированная строка
 * 
 * @example
 * formatPointsWithDescription(100, "за сессию") // "100 баллов за сессию"
 */
export function formatPointsWithDescription(
  amount: number,
  description: string
): string {
  return `${formatPoints(amount)} баллов ${description}`
}

