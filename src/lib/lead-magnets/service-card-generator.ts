/**
 * Генератор визуальных карточек для лид-магнитов типа "сервис"
 * Создает красивое изображение с ключевой информацией
 */

import { createCanvas, registerFont } from 'canvas'
import type { LeadMagnet } from '@/types/lead-magnet'

/**
 * Генерирует визуальную карточку для сервиса
 */
export async function generateServiceCardImage(
  leadMagnet: Pick<LeadMagnet, 'title' | 'description' | 'emoji' | 'highlights'>
): Promise<Buffer> {
  // Размеры карточки
  const width = 800
  const height = 600

  // Создаем canvas
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Градиентный фон (зеленый для сервисов)
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#10B981') // emerald-500
  gradient.addColorStop(1, '#059669') // emerald-600

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Белый текст
  ctx.fillStyle = '#FFFFFF'
  ctx.textAlign = 'center'

  // Emoji (большой)
  ctx.font = 'bold 120px Arial'
  ctx.fillText(leadMagnet.emoji || '💼', width / 2, 180)

  // Заголовок
  ctx.font = 'bold 48px Arial'
  const title = leadMagnet.title.length > 30 
    ? leadMagnet.title.substring(0, 27) + '...' 
    : leadMagnet.title
  ctx.fillText(title, width / 2, 280)

  // Описание
  ctx.font = '28px Arial'
  ctx.globalAlpha = 0.9
  const description = leadMagnet.description.length > 60
    ? leadMagnet.description.substring(0, 57) + '...'
    : leadMagnet.description
  ctx.fillText(description, width / 2, 340)

  // Первый highlight (если есть)
  if (leadMagnet.highlights && leadMagnet.highlights.length > 0) {
    ctx.font = '24px Arial'
    ctx.globalAlpha = 0.8
    const highlight = leadMagnet.highlights[0].length > 50
      ? leadMagnet.highlights[0].substring(0, 47) + '...'
      : leadMagnet.highlights[0]
    ctx.fillText(`✓ ${highlight}`, width / 2, 420)
  }

  // Дополнительный бейдж "Услуга"
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(width / 2 - 80, 480, 160, 50)
  
  ctx.globalAlpha = 1
  ctx.fillStyle = '#10B981'
  ctx.font = 'bold 24px Arial'
  ctx.fillText('УСЛУГА', width / 2, 515)

  // Конвертируем в PNG Buffer
  return canvas.toBuffer('image/png')
}

/**
 * Генерирует превью для карточки (меньший размер)
 */
export async function generateServiceCardPreview(
  leadMagnet: Pick<LeadMagnet, 'title' | 'description' | 'emoji' | 'highlights'>
): Promise<Buffer> {
  // Генерируем полноразмерную карточку
  const fullImage = await generateServiceCardImage(leadMagnet)
  
  // Оптимизируем размер через sharp
  const sharp = (await import('sharp')).default
  return await sharp(fullImage)
    .resize(400, 300, { fit: 'cover' })
    .webp({ quality: 85 })
    .toBuffer()
}

