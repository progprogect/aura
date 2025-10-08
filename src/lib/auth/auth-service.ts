/**
 * Рефакторированный основной сервис авторизации
 */

import { sendSMS } from './sms-service'
import { SpecialistService, SocialAccountService, SessionService, SMSVerificationService } from './business-logic'
import { 
  validateRegistrationRequest, 
  validateLoginRequest,
  validateSendSMSRequest
} from './validation'
import { extractSocialData, debugLog } from './utils'
import { AUTH_ERRORS } from './types'
import type { 
  AuthResponse,
  UserProfile
} from './types'
import type { 
  ValidatedRegistrationRequest,
  ValidatedLoginRequest,
  SendSMSRequest
} from './validation'

// ========================================
// ОТПРАВКА SMS
// ========================================

export async function sendVerificationSMS(phone: string, purpose: 'registration' | 'login' | 'recovery') {
  const validation = validateSendSMSRequest({ phone, purpose })
  
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Ошибка валидации'
    }
  }
  
  const { data } = validation
  
  // Проверяем rate limiting
  const rateLimitCheck = await checkRateLimit(data.phone)
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      error: 'Превышен лимит отправки SMS. Попробуйте позже.'
    }
  }
  
  // Отправляем SMS
  return await sendSMS({
    phone: data.phone,
    purpose: data.purpose,
    testMode: process.env.NODE_ENV !== 'production'
  })
}

// ========================================
// РЕГИСТРАЦИЯ
// ========================================

export async function registerSpecialist(request: unknown): Promise<AuthResponse> {
  const validation = validateRegistrationRequest(request)
  
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Ошибка валидации'
    }
  }
  
  const { data } = validation
  
  try {
    debugLog('Начало регистрации', { provider: data.provider })
    
    if (data.provider === 'phone') {
      return await registerWithPhone(data)
    } else {
      return await registerWithSocial(data)
    }
    
  } catch (error) {
    console.error('[auth-service] Ошибка регистрации:', error)
    debugLog('Ошибка регистрации', error)
    return {
      success: false,
      error: 'Произошла ошибка при регистрации'
    }
  }
}

async function registerWithPhone(data: ValidatedRegistrationRequest): Promise<AuthResponse> {
  if (!data.phone || !data.code) {
    return {
      success: false,
      error: 'Необходимо указать номер телефона и код подтверждения'
    }
  }
  
  const { phone, code } = data
  // Проверяем код
  const verification = await SMSVerificationService.verifyCode(phone, code, 'registration')
  
  if (!verification.success) {
    return {
      success: false,
      error: verification.error
    }
  }
  
  // Проверяем, не зарегистрирован ли уже этот номер
  const exists = await SpecialistService.existsByPhone(phone)
  if (exists) {
    return {
      success: false,
      error: 'Специалист с таким номером телефона уже зарегистрирован',
      errorCode: AUTH_ERRORS.PHONE_ALREADY_EXISTS
    }
  }
  
  // Создаём специалиста
  const specialist = await SpecialistService.createSpecialist(phone)
  
  // Создаём сессию
  const session = await SessionService.createSession(specialist.id)
  
  debugLog('Регистрация завершена', { specialistId: specialist.id })
  
  return {
    success: true,
    sessionToken: session.sessionToken,
    specialist: mapSpecialistToProfile(specialist),
    isNewUser: true,
    requiresProfileCompletion: true
  }
}

async function registerWithSocial(data: ValidatedRegistrationRequest): Promise<AuthResponse> {
  if (!data.socialData) {
    return {
      success: false,
      error: 'Необходимо указать данные социального аккаунта'
    }
  }
  
  const { socialData } = data
  
  // Проверяем, не зарегистрирован ли уже этот социальный аккаунт
  const existingAccount = await SocialAccountService.findByProvider(socialData.provider, socialData.providerId)
  
  if (existingAccount) {
    // Если аккаунт уже существует, создаём сессию
    const session = await SessionService.createSession(existingAccount.specialistId)
    
    return {
      success: true,
      sessionToken: session.sessionToken,
      specialist: mapSpecialistToProfile(existingAccount.specialist),
      isNewUser: false
    }
  }
  
  // Извлекаем данные из социального профиля
  const extractedData = extractSocialData(socialData.provider, socialData.rawData || {})
  
  // Создаём специалиста
  const specialist = await SpecialistService.createSpecialist(
    extractedData.phone || 'social-user', 
    extractedData
  )
  
  // Создаём социальный аккаунт
  await SocialAccountService.createAccount(specialist.id, socialData)
  
  // Создаём сессию
  const session = await SessionService.createSession(specialist.id)
  
  debugLog('Социальная регистрация завершена', { specialistId: specialist.id })
  
  return {
    success: true,
    sessionToken: session.sessionToken,
    specialist: mapSpecialistToProfile(specialist),
    isNewUser: true,
    requiresProfileCompletion: true
  }
}

// ========================================
// ВХОД
// ========================================

export async function loginSpecialist(request: unknown): Promise<AuthResponse> {
  const validation = validateLoginRequest(request)
  
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Ошибка валидации'
    }
  }
  
  const { data } = validation
  
  try {
    debugLog('Начало входа', { provider: data.provider })
    
    if (data.provider === 'phone') {
      return await loginWithPhone(data)
    } else {
      return await loginWithSocial(data)
    }
    
  } catch (error) {
    debugLog('Ошибка входа', error)
    return {
      success: false,
      error: 'Произошла ошибка при входе'
    }
  }
}

async function loginWithPhone(data: ValidatedLoginRequest): Promise<AuthResponse> {
  if (!data.phone || !data.code) {
    return {
      success: false,
      error: 'Необходимо указать номер телефона и код подтверждения'
    }
  }
  
  const { phone, code } = data
  
  // Проверяем код
  const verification = await SMSVerificationService.verifyCode(phone, code, 'login')
  
  if (!verification.success) {
    return {
      success: false,
      error: verification.error
    }
  }
  
  // Ищем специалиста
  const specialist = await SpecialistService.findByPhone(phone)
  
  if (!specialist) {
    return {
      success: false,
      error: 'Специалист с таким номером телефона не найден',
      errorCode: AUTH_ERRORS.SESSION_INVALID
    }
  }
  
  // Создаём сессию
  const session = await SessionService.createSession(specialist.id)
  
  debugLog('Вход завершён', { specialistId: specialist.id })
  
  return {
    success: true,
    sessionToken: session.sessionToken,
    specialist: mapSpecialistToProfile(specialist),
    isNewUser: false
  }
}

async function loginWithSocial(data: ValidatedLoginRequest): Promise<AuthResponse> {
  if (!data.socialData) {
    return {
      success: false,
      error: 'Необходимо указать данные социального аккаунта'
    }
  }
  
  const { socialData } = data
  
  // Ищем существующий социальный аккаунт
  const socialAccount = await SocialAccountService.findByProvider(socialData.provider, socialData.providerId)
  
  if (!socialAccount) {
    return {
      success: false,
      error: 'Аккаунт не найден. Зарегистрируйтесь сначала'
    }
  }
  
  // Создаём сессию
  const session = await SessionService.createSession(socialAccount.specialistId)
  
  debugLog('Социальный вход завершён', { specialistId: socialAccount.specialistId })
  
  return {
    success: true,
    sessionToken: session.sessionToken,
    specialist: mapSpecialistToProfile(socialAccount.specialist),
    isNewUser: false
  }
}

// ========================================
// ПОЛУЧЕНИЕ ПРОФИЛЯ ПО СЕССИИ
// ========================================

export async function getProfileBySession(sessionToken: string): Promise<{
  success: boolean
  profile?: UserProfile
  error?: string
}> {
  try {
    const validation = await SessionService.validateAndUpdateSession(sessionToken)
    
    if (!validation.valid || !validation.session) {
      return {
        success: false,
        error: 'Недействительная сессия'
      }
    }
    
    return {
      success: true,
      profile: mapSpecialistToProfile(validation.session.specialist)
    }
    
  } catch (error) {
    debugLog('Ошибка получения профиля', error)
    return {
      success: false,
      error: 'Произошла ошибка при получении профиля'
    }
  }
}

// ========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

function mapSpecialistToProfile(specialist: any): UserProfile {
  return {
    id: specialist.id,
    firstName: specialist.firstName,
    lastName: specialist.lastName,
    phone: specialist.phone,
    email: specialist.email,
    avatar: specialist.avatar,
    slug: specialist.slug,
    verified: specialist.verified,
    subscriptionTier: specialist.subscriptionTier as 'FREE' | 'PREMIUM',
    createdAt: specialist.createdAt,
    updatedAt: specialist.updatedAt
  }
}

async function checkRateLimit(phone: string): Promise<{ allowed: boolean; resetTime?: Date }> {
  // Простая проверка rate limit (можно улучшить с Redis)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  // Здесь должна быть логика проверки лимитов
  // Для простоты всегда разрешаем
  return { allowed: true }
}
