import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Утилита для объединения классов Tailwind CSS
 * Использует clsx для условных классов и tailwind-merge для объединения
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Форматирование даты для русскоязычного интерфейса
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Форматирование числа с разделением тысяч
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU')
}



