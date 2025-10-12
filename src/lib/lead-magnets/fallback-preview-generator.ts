/**
 * Fallback Preview Generator
 * Генерация квадратного превью с emoji на градиентном фоне через Node.js Canvas
 */

import { createCanvas } from 'canvas'
import type { LeadMagnetType } from '@/types/lead-magnet'

export interface FallbackPreviewOptions {
  type: LeadMagnetType
  emoji: string
  title?: string
}

export interface FallbackPreviewResult {
  buffer: Buffer
  mimeType: string
  width: number
  height: number
}

/**
 * Получить градиент по типу лид-магнита
 */
function getGradientColors(type: LeadMagnetType): { start: string; end: string } {
  switch (type) {
    case 'file':
      return { start: '#3B82F6', end: '#1E40AF' } // Синий градиент
    case 'link':
      return { start: '#8B5CF6', end: '#6D28D9' } // Фиолетовый градиент
    case 'service':
      return { start: '#EC4899', end: '#BE185D' } // Розовый градиент
    default:
      return { start: '#3B82F6', end: '#1E40AF' }
  }
}

/**
 * Генерация fallback превью
 * @param options - параметры генерации
 * @returns Buffer PNG изображения 800x800
 */
export async function generateFallbackPreview(
  options: FallbackPreviewOptions
): Promise<FallbackPreviewResult> {
  const { type, emoji } = options
  const size = 800 // Квадрат 800x800
  
  // Создаём canvas
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Получаем цвета градиента
  const colors = getGradientColors(type)

  // Создаём градиентный фон
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, colors.start)
  gradient.addColorStop(1, colors.end)
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // Рисуем emoji в центре
  // Используем большой размер шрифта для emoji
  const emojiFontSize = 240
  ctx.font = `${emojiFontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  
  // Рисуем emoji с небольшой тенью для глубины
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 10
  ctx.fillText(emoji, size / 2, size / 2)

  // Экспортируем в PNG
  const buffer = canvas.toBuffer('image/png')

  return {
    buffer,
    mimeType: 'image/png',
    width: size,
    height: size
  }
}

/**
 * Синхронная версия для тестирования
 */
export function generateFallbackPreviewSync(
  options: FallbackPreviewOptions
): FallbackPreviewResult {
  const { type, emoji } = options
  const size = 800
  
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const colors = getGradientColors(type)
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, colors.start)
  gradient.addColorStop(1, colors.end)
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const emojiFontSize = 240
  ctx.font = `${emojiFontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 10
  ctx.fillText(emoji, size / 2, size / 2)

  const buffer = canvas.toBuffer('image/png')

  return {
    buffer,
    mimeType: 'image/png',
    width: size,
    height: size
  }
}

/**
 * Получить CSS градиент для preview на фронте
 */
export function getFallbackGradientCSS(type: LeadMagnetType): string {
  const colors = getGradientColors(type)
  return `linear-gradient(135deg, ${colors.start} 0%, ${colors.end} 100%)`
}

