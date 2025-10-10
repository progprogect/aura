/**
 * Общие типы для лид-магнитов
 * Единый источник правды для всех компонентов
 */

// Тип лид-магнита (строгий литеральный тип)
export type LeadMagnetType = 'file' | 'link' | 'service'

/**
 * Проверка валидности типа лид-магнита
 */
export function isValidLeadMagnetType(type: string): type is LeadMagnetType {
  return type === 'file' || type === 'link' || type === 'service'
}

/**
 * Конвертация Prisma объекта в типизированный LeadMagnet
 * Безопасно приводит type: string → type: LeadMagnetType
 */
export function fromPrismaLeadMagnet(prismaObj: any): LeadMagnet {
  // Валидация типа на runtime
  if (!isValidLeadMagnetType(prismaObj.type)) {
    throw new Error(`Invalid lead magnet type: ${prismaObj.type}`)
  }

  return {
    ...prismaObj,
    type: prismaObj.type as LeadMagnetType,
  }
}

// Базовый интерфейс лид-магнита
export interface LeadMagnet {
  id: string
  type: LeadMagnetType
  title: string
  description: string
  emoji: string
  fileUrl?: string | null
  linkUrl?: string | null
  slug?: string | null
  highlights?: string[]
  targetAudience?: string | null
  fileSize?: string | null
  ogImage?: string | null
  viewCount?: number
  downloadCount?: number
}

// Упрощенная версия для UI компонентов (без необязательных полей)
export interface LeadMagnetUI {
  id: string
  type: LeadMagnetType
  title: string
  description: string
  emoji: string
  fileUrl?: string | null
  linkUrl?: string | null
  slug?: string | null
  highlights?: string[]
  targetAudience?: string | null
  fileSize?: string | null
  ogImage?: string | null
  viewCount?: number
  downloadCount?: number
  createdAt?: Date | string
}

// Версия для редактирования (может быть без ID при создании)
export interface LeadMagnetFormData {
  type: LeadMagnetType
  title: string
  description: string
  emoji: string
  fileUrl?: string
  linkUrl?: string
  highlights?: string[]
  targetAudience?: string
  ogImage?: string
}

// Для редактирования существующего лид-магнита
export interface EditableLeadMagnet {
  id: string
  type: LeadMagnetType
  title: string
  description: string
  fileUrl?: string | null
  linkUrl?: string | null
  emoji: string
  highlights?: string[]
  targetAudience?: string | null
}

