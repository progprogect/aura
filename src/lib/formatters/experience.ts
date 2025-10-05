/**
 * Форматирование опыта работы
 */

/**
 * Форматирование лет опыта с правильным склонением
 * @param years - Количество лет
 * @returns Отформатированная строка
 * 
 * @example
 * formatExperience(1) // "1 год"
 * formatExperience(2) // "2 года"
 * formatExperience(5) // "5 лет"
 * formatExperience(11) // "11 лет"
 */
export function formatExperience(years: number | null): string | null {
  if (!years || years < 0) return null
  
  // Правила склонения для русского языка
  const lastDigit = years % 10
  const lastTwoDigits = years % 100
  
  // 11-14 всегда "лет"
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${years} лет`
  }
  
  // 1 - "год"
  if (lastDigit === 1) {
    return `${years} год`
  }
  
  // 2, 3, 4 - "года"
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${years} года`
  }
  
  // Остальное - "лет"
  return `${years} лет`
}

/**
 * Получение короткого лейбла опыта
 * @param years - Количество лет
 * @returns Короткая строка для отображения
 * 
 * @example
 * getExperienceLabel(1) // "1 год опыта"
 * getExperienceLabel(3) // "3 года опыта"
 * getExperienceLabel(10) // "10+ лет опыта"
 */
export function getExperienceLabel(years: number | null): string | null {
  if (!years || years < 0) return null
  
  const formatted = formatExperience(years)
  
  if (!formatted) return null
  
  // Для 10+ показываем как "10+ лет"
  if (years >= 10) {
    return `${years}+ лет опыта`
  }
  
  return `${formatted} опыта`
}

/**
 * Получение диапазона опыта для фильтра
 * @param years - Количество лет
 * @returns Значение фильтра ('0-2', '2-5', '5+')
 */
export function getExperienceRange(years: number | null): string {
  if (!years || years < 0) return 'any'
  
  if (years < 2) return '0-2'
  if (years < 5) return '2-5'
  return '5+'
}

/**
 * Форматирование опыта в читаемый формат для карточки
 * @param years - Количество лет
 * @returns Компактная строка
 * 
 * @example
 * formatExperienceCompact(1) // "1г"
 * formatExperienceCompact(3) // "3г"
 * formatExperienceCompact(10) // "10+л"
 */
export function formatExperienceCompact(years: number | null): string | null {
  if (!years || years < 0) return null
  
  if (years >= 10) {
    return `${years}+л`
  }
  
  return `${years}г`
}

