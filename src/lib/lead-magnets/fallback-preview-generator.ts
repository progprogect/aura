/**
 * Fallback Preview Generator
 * Генерация квадратного превью с emoji на градиентном фоне через Node.js Canvas
 */

import { createCanvas } from 'canvas'
import type { LeadMagnetType } from '@/types/lead-magnet'
import { PREVIEW_SIZES, FALLBACK_GRADIENTS, CANVAS_CONFIG } from './constants'

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
  return FALLBACK_GRADIENTS[type] || FALLBACK_GRADIENTS.file
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
  const size = PREVIEW_SIZES.FALLBACK
  
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

  // Рисуем emoji в центре с точным позиционированием
  ctx.font = `${PREVIEW_SIZES.EMOJI_FONT}px ${CANVAS_CONFIG.FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = `rgba(255, 255, 255, ${CANVAS_CONFIG.EMOJI_OPACITY})`
  
  // Точные координаты центра (целые числа для четкости)
  const centerX = Math.round(size / 2)
  const centerY = Math.round(size / 2)
  
  // Рисуем emoji с тенью для глубины
  ctx.shadowColor = CANVAS_CONFIG.SHADOW_COLOR
  ctx.shadowBlur = CANVAS_CONFIG.SHADOW_BLUR
  ctx.shadowOffsetY = CANVAS_CONFIG.SHADOW_OFFSET_Y
  ctx.fillText(emoji, centerX, centerY)

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
  const size = PREVIEW_SIZES.FALLBACK
  
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const colors = getGradientColors(type)
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, colors.start)
  gradient.addColorStop(1, colors.end)
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  ctx.font = `${PREVIEW_SIZES.EMOJI_FONT}px ${CANVAS_CONFIG.FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = `rgba(255, 255, 255, ${CANVAS_CONFIG.EMOJI_OPACITY})`
  
  // Точные координаты центра (целые числа для четкости)
  const centerX = Math.round(size / 2)
  const centerY = Math.round(size / 2)
  
  ctx.shadowColor = CANVAS_CONFIG.SHADOW_COLOR
  ctx.shadowBlur = CANVAS_CONFIG.SHADOW_BLUR
  ctx.shadowOffsetY = CANVAS_CONFIG.SHADOW_OFFSET_Y
  ctx.fillText(emoji, centerX, centerY)

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
  const colors = FALLBACK_GRADIENTS[type] || FALLBACK_GRADIENTS.file
  return `linear-gradient(135deg, ${colors.start} 0%, ${colors.end} 100%)`
}

