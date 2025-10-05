/**
 * Форматирование форматов работы специалистов
 */

/**
 * Форматирование формата работы для отображения
 * 
 * @param format - Формат работы ('online', 'offline', 'hybrid')
 * @returns Читаемое название
 */
export function formatWorkFormat(format: string): string {
  const labels: Record<string, string> = {
    online: 'Онлайн',
    offline: 'Офлайн',
    hybrid: 'Гибрид',
  }

  return labels[format] || format
}

/**
 * Получение цвета для формата работы
 * 
 * @param format - Формат работы
 * @returns Tailwind классы для стилизации
 */
export function getWorkFormatColor(format: string): string {
  const colors: Record<string, string> = {
    online: 'bg-green-50 text-green-700 border-green-200',
    offline: 'bg-purple-50 text-purple-700 border-purple-200',
    hybrid: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  return colors[format] || 'bg-gray-50 text-gray-700 border-gray-200'
}

