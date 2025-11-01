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

/**
 * Универсальная функция для склонения русского слова по числу
 * 
 * @param count - Количество
 * @param one - Форма для 1, 21, 31, ...
 * @param few - Форма для 2-4, 22-24, ...
 * @param many - Форма для 0, 5-20, 25-30, ...
 * @returns Правильная форма слова
 * 
 * @example
 * pluralize(1, 'отзыв', 'отзыва', 'отзывов')  // "отзыв"
 * pluralize(3, 'отзыв', 'отзыва', 'отзывов')  // "отзыва"
 * pluralize(5, 'отзыв', 'отзыва', 'отзывов')  // "отзывов"
 */
export function pluralize(count: number, one: string, few: string, many: string): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  // 11-14 всегда many
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return many
  }

  // 1 - one
  if (lastDigit === 1) {
    return one
  }

  // 2, 3, 4 - few
  if (lastDigit >= 2 && lastDigit <= 4) {
    return few
  }

  // Остальное - many
  return many
}

