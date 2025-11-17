/**
 * Утилиты для работы со специализациями
 * Парсинг, валидация и обработка специализаций
 */

export const MAX_SPECIALIZATIONS = 5
export const MIN_SPECIALIZATION_LENGTH = 2

/**
 * Валидация одной специализации
 * @param spec - специализация для валидации
 * @returns true если валидна
 */
export function validateSpecialization(spec: string): boolean {
  const trimmed = spec.trim()
  return trimmed.length >= MIN_SPECIALIZATION_LENGTH
}

/**
 * Парсинг строки в массив специализаций
 * Поддерживает ввод через запятую и одиночные значения
 * 
 * @param input - входная строка (может содержать запятые)
 * @param existing - уже существующие специализации (для дедупликации)
 * @returns массив валидных специализаций
 * 
 * @example
 * parseSpecializations("КПТ, ДПТ, работа с тревогой", ["КПТ"])
 * // ["ДПТ", "работа с тревогой"]
 */
export function parseSpecializations(
  input: string,
  existing: string[] = []
): string[] {
  if (!input || !input.trim()) {
    return []
  }

  // Разделяем по запятой
  const parts = input.split(',').map(part => part.trim()).filter(Boolean)

  // Обрабатываем каждую часть
  const newSpecializations: string[] = []
  const existingLower = existing.map(s => s.toLowerCase())

  for (const part of parts) {
    // Валидация минимальной длины (пустые уже отфильтрованы filter(Boolean))
    if (!validateSpecialization(part)) continue

    // Дедупликация (без учета регистра)
    if (existingLower.includes(part.toLowerCase())) continue

    // Дедупликация внутри нового списка
    if (newSpecializations.some(s => s.toLowerCase() === part.toLowerCase())) continue

    newSpecializations.push(part)
  }

  return newSpecializations
}

/**
 * Проверка, можно ли добавить еще специализаций
 * @param currentCount - текущее количество специализаций
 * @returns true если можно добавить
 */
export function canAddSpecialization(currentCount: number): boolean {
  return currentCount < MAX_SPECIALIZATIONS
}

