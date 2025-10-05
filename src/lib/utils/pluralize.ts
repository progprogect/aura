/**
 * Утилиты для склонения русских слов
 */

/**
 * Склонение слова "специалист"
 * 
 * @param count - Количество
 * @returns Правильная форма слова
 * 
 * @example
 * pluralizeSpecialist(1)  // "специалист"
 * pluralizeSpecialist(2)  // "специалиста"
 * pluralizeSpecialist(5)  // "специалистов"
 */
export function pluralizeSpecialist(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  // 11-14 всегда "специалистов"
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'специалистов'
  }

  // 1 - "специалист"
  if (lastDigit === 1) {
    return 'специалист'
  }

  // 2, 3, 4 - "специалиста"
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'специалиста'
  }

  // Остальное - "специалистов"
  return 'специалистов'
}

/**
 * Форматирование с количеством и склонением
 * 
 * @example
 * formatSpecialistCount(3)  // "3 специалиста"
 */
export function formatSpecialistCount(count: number): string {
  return `${count} ${pluralizeSpecialist(count)}`
}

