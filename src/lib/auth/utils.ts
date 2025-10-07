/**
 * Утилиты для системы авторизации
 */

import { randomBytes, createHash } from 'crypto'
import { AUTH_ERRORS, VALIDATION_RULES } from './types'

// ========================================
// ВАЛИДАЦИЯ ДАННЫХ
// ========================================

export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  if (!phone) {
    return { isValid: false, error: 'Номер телефона обязателен' }
  }
  
  if (!VALIDATION_RULES.phone.pattern.test(phone)) {
    return { isValid: false, error: VALIDATION_RULES.phone.message }
  }
  
  return { isValid: true }
}

export function validateSMSCode(code: string): { isValid: boolean; error?: string } {
  if (!code) {
    return { isValid: false, error: 'Код обязателен' }
  }
  
  if (!VALIDATION_RULES.smsCode.pattern.test(code)) {
    return { isValid: false, error: VALIDATION_RULES.smsCode.message }
  }
  
  return { isValid: true }
}

export function validateName(name: string): { isValid: boolean; error?: string } {
  if (!name) {
    return { isValid: false, error: 'Имя обязательно' }
  }
  
  if (name.length < VALIDATION_RULES.name.minLength) {
    return { isValid: false, error: `Имя должно содержать минимум ${VALIDATION_RULES.name.minLength} символа` }
  }
  
  if (name.length > VALIDATION_RULES.name.maxLength) {
    return { isValid: false, error: `Имя должно содержать максимум ${VALIDATION_RULES.name.maxLength} символов` }
  }
  
  if (!VALIDATION_RULES.name.pattern.test(name)) {
    return { isValid: false, error: VALIDATION_RULES.name.message }
  }
  
  return { isValid: true }
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email обязателен' }
  }
  
  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return { isValid: false, error: VALIDATION_RULES.email.message }
  }
  
  return { isValid: true }
}

// ========================================
// ГЕНЕРАЦИЯ КОДОВ И ТОКЕНОВ
// ========================================

export function generateSMSCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export function generateDeviceFingerprint(userAgent: string, additionalData?: Record<string, any>): string {
  const data = {
    userAgent,
    timestamp: Date.now(),
    ...additionalData
  }
  
  return createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex')
}

export function generateStateToken(): string {
  return randomBytes(16).toString('hex')
}

// ========================================
// РАБОТА С НОМЕРАМИ ТЕЛЕФОНОВ
// ========================================

export function normalizePhone(phone: string): string {
  // Убираем все символы кроме цифр
  const digits = phone.replace(/\D/g, '')
  
  // Если номер начинается с 8, заменяем на +7
  if (digits.startsWith('8')) {
    return '+7' + digits.slice(1)
  }
  
  // Если номер начинается с 7, добавляем +
  if (digits.startsWith('7')) {
    return '+' + digits
  }
  
  // Если номер уже в формате +7, возвращаем как есть
  if (phone.startsWith('+7')) {
    return phone
  }
  
  // В остальных случаях добавляем +7
  return '+7' + digits
}

export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  
  if (normalized.startsWith('+7')) {
    const digits = normalized.slice(2)
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
  }
  
  return normalized
}

export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  
  if (normalized.startsWith('+7') && normalized.length === 12) {
    const digits = normalized.slice(2)
    return `+7 (${digits.slice(0, 3)}) ***-**-${digits.slice(8, 10)}`
  }
  
  return normalized
}

// ========================================
// РАБОТА С ВРЕМЕНЕМ
// ========================================

export function isExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

export function getExpiryTime(minutes: number = 5): Date {
  return new Date(Date.now() + minutes * 60 * 1000)
}

export function getSessionExpiryTime(days: number = 30): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

export function getTimeUntilExpiry(expiresAt: Date): number {
  return Math.max(0, expiresAt.getTime() - Date.now())
}

export function formatTimeUntilExpiry(expiresAt: Date): string {
  const timeLeft = getTimeUntilExpiry(expiresAt)
  
  if (timeLeft <= 0) {
    return 'Истёк'
  }
  
  const minutes = Math.floor(timeLeft / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// ========================================
// ОБРАБОТКА ОШИБОК
// ========================================

export function createAuthError(code: string, message: string, details?: Record<string, any>) {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString()
  }
}

export function isAuthError(error: any): error is { code: string; message: string; details?: any } {
  return error && typeof error.code === 'string' && typeof error.message === 'string'
}

export function getErrorMessage(error: any): string {
  if (isAuthError(error)) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'Произошла неизвестная ошибка'
}

// ========================================
// РАБОТА С СОЦИАЛЬНЫМИ ДАННЫМИ
// ========================================

export function extractSocialData(provider: string, rawData: any) {
  switch (provider) {
    case 'google':
      return {
        email: rawData.email,
        name: rawData.name,
        picture: rawData.picture,
        providerId: rawData.sub || rawData.id
      }
    
    case 'vk':
      return {
        email: rawData.email,
        firstName: rawData.first_name,
        lastName: rawData.last_name,
        picture: rawData.photo_max_orig || rawData.photo_200,
        providerId: rawData.id?.toString()
      }
    
    case 'yandex':
      return {
        email: rawData.default_email,
        firstName: rawData.first_name,
        lastName: rawData.last_name,
        picture: rawData.default_avatar_id ? `https://avatars.yandex.net/get-yapic/${rawData.default_avatar_id}/islands-200` : undefined,
        providerId: rawData.id?.toString()
      }
    
    case 'whatsapp':
      return {
        phone: rawData.phone_number,
        name: rawData.profile?.name,
        picture: rawData.profile?.picture,
        providerId: rawData.phone_number
      }
    
    case 'telegram':
      return {
        phone: rawData.phone_number,
        username: rawData.username,
        firstName: rawData.first_name,
        lastName: rawData.last_name,
        picture: rawData.photo_url,
        providerId: rawData.id?.toString()
      }
    
    default:
      return {}
  }
}

export function mergeSocialData(current: any, newData: any): any {
  return {
    ...current,
    ...newData,
    // Приоритет отдаём более полным данным
    name: newData.name || current.name,
    email: newData.email || current.email,
    picture: newData.picture || current.picture
  }
}

// ========================================
// БЕЗОПАСНОСТЬ
// ========================================

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Убираем потенциально опасные символы
    .slice(0, 1000) // Ограничиваем длину
}

export function isSecurePassword(password: string): boolean {
  // Минимум 8 символов, хотя бы одна буква и одна цифра
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
}

export function generateCSRFToken(): string {
  return randomBytes(32).toString('base64')
}

// ========================================
// ФОРМАТИРОВАНИЕ
// ========================================

export function formatUserName(firstName: string, lastName?: string): string {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.join(' ')
}

export function formatInitials(firstName: string, lastName?: string): string {
  const first = firstName.charAt(0).toUpperCase()
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text
  }
  
  return text.slice(0, maxLength - 3) + '...'
}

// ========================================
// УТИЛИТЫ ДЛЯ РАЗРАБОТКИ
// ========================================

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test'
}

export function shouldLogDebug(): boolean {
  return isDevelopment() || process.env.DEBUG_AUTH === 'true'
}

export function debugLog(message: string, data?: any): void {
  if (shouldLogDebug()) {
    console.log(`[AUTH DEBUG] ${message}`, data || '')
  }
}
