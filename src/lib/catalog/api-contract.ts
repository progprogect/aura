/**
 * API контракт между фронтендом и бэкендом
 * Определяет типы данных и трансформеры
 */

import { SpecialistDTO, SpecialistViewModel } from './types'

// ========================================
// ТРАНСФОРМЕРЫ
// ========================================

/**
 * Трансформация DTO специалиста в ViewModel
 * Добавляет вычисляемые поля для UI
 * 
 * @param dto - DTO из API
 * @returns ViewModel для использования в компонентах
 */
export function transformSpecialistDTO(dto: SpecialistDTO): SpecialistViewModel {
  return {
    ...dto,
    fullName: `${dto.firstName} ${dto.lastName}`,
    shortAbout: truncateText(dto.about, 150),
  }
}

/**
 * Трансформация массива DTO в массив ViewModel
 */
export function transformSpecialistsDTO(
  dtos: SpecialistDTO[]
): SpecialistViewModel[] {
  return dtos.map(transformSpecialistDTO)
}

// ========================================
// УТИЛИТЫ
// ========================================

/**
 * Обрезка текста с добавлением многоточия
 * @param text - Исходный текст
 * @param maxLength - Максимальная длина
 * @returns Обрезанный текст
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  
  // Обрезаем по последнему пробелу, чтобы не разрывать слова
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > 0 && lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

/**
 * Валидация DTO специалиста
 * Проверяет наличие обязательных полей
 */
export function validateSpecialistDTO(dto: any): dto is SpecialistDTO {
  return (
    dto &&
    typeof dto.id === 'string' &&
    typeof dto.firstName === 'string' &&
    typeof dto.lastName === 'string' &&
    typeof dto.slug === 'string' &&
    typeof dto.category === 'string' &&
    Array.isArray(dto.specializations) &&
    typeof dto.about === 'string'
  )
}

/**
 * Валидация массива DTO
 */
export function validateSpecialistsDTO(dtos: any): dtos is SpecialistDTO[] {
  return Array.isArray(dtos) && dtos.every(validateSpecialistDTO)
}

// ========================================
// API RESPONSE HELPERS
// ========================================

/**
 * Обработка ответа API со специалистами
 * Трансформирует данные и валидирует их
 */
export async function processSpecialistsResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.specialists || !Array.isArray(data.specialists)) {
    throw new Error('Invalid response format: specialists array not found')
  }

  if (!data.pagination) {
    throw new Error('Invalid response format: pagination not found')
  }

  // Валидируем DTO
  if (!validateSpecialistsDTO(data.specialists)) {
    throw new Error('Invalid specialists data format')
  }

  // Трансформируем в ViewModel
  return {
    specialists: transformSpecialistsDTO(data.specialists),
    pagination: data.pagination,
  }
}

// ========================================
// ERROR HANDLING
// ========================================

/**
 * Обработка ошибок API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Парсинг ошибок из ответа API
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const data = await response.json()
    return new ApiError(
      data.error || 'Unknown error',
      response.status,
      data.details
    )
  } catch {
    return new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status
    )
  }
}

