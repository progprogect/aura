/**
 * Основной сервис авторизации
 */

import { prisma } from '@/lib/db'
import { sendSMS, verifySMSCode } from './sms-service'
import { createSession, validateSession } from './session-service'
import { 
  normalizePhone, 
  validatePhone, 
  validateSMSCode as validateCode,
  validateName,
  generateSlug,
  extractSocialData,
  debugLog,
  createAuthError
} from './utils'
import { AUTH_PROVIDERS, AUTH_ERRORS } from './types'
import type { 
  AuthProvider, 
  RegistrationRequest, 
  LoginRequest, 
  AuthResponse,
  SocialProfile,
  UserProfile
} from './types'

// ========================================
// РЕГИСТРАЦИЯ
// ========================================

export async function registerSpecialist(request: RegistrationRequest): Promise<AuthResponse> {
  try {
    debugLog('Начало регистрации', { provider: request.provider })
    
    if (request.provider === 'phone') {
      return await registerWithPhone(request)
    } else {
      return await registerWithSocial(request)
    }
    
  } catch (error) {
    debugLog('Ошибка регистрации', error)
    return {
      success: false,
      error: 'Произошла ошибка при регистрации'
    }
  }
}

async function registerWithPhone(request: RegistrationRequest): Promise<AuthResponse> {
  const { phone, code } = request
  
  if (!phone || !code) {
    return {
      success: false,
      error: 'Необходимо указать номер телефона и код подтверждения'
    }
  }
  
  // Валидируем телефон
  const phoneValidation = validatePhone(phone)
  if (!phoneValidation.isValid) {
    return {
      success: false,
      error: phoneValidation.error
    }
  }
  
  // Валидируем код
  const codeValidation = validateCode(code)
  if (!codeValidation.isValid) {
    return {
      success: false,
      error: codeValidation.error
    }
  }
  
  const normalizedPhone = normalizePhone(phone)
  
  // Проверяем код
  const verification = await verifySMSCode({
    phone: normalizedPhone,
    code,
    purpose: 'registration'
  })
  
  if (!verification.success) {
    return {
      success: false,
      error: verification.error
    }
  }
  
  // Проверяем, не зарегистрирован ли уже этот номер
  const existingSpecialist = await prisma.specialist.findFirst({
    where: { phone: normalizedPhone }
  })
  
  if (existingSpecialist) {
    return {
      success: false,
      error: 'Специалист с таким номером телефона уже зарегистрирован',
      errorCode: AUTH_ERRORS.PHONE_ALREADY_EXISTS
    }
  }
  
  // Создаём специалиста с минимальными данными
  const specialist = await prisma.specialist.create({
    data: {
      firstName: 'Новый',
      lastName: 'Специалист',
      phone: normalizedPhone,
      slug: await generateUniqueSlug('new-specialist'),
      category: 'other',
      specializations: ['Специалист'],
      about: 'Профиль будет заполнен позже',
      workFormats: ['online'],
      verified: false,
      acceptingClients: false
    }
  })
  
  // Создаём сессию
  const sessionData = await createSession(specialist.id)
  
  debugLog('Регистрация завершена', { specialistId: specialist.id })
  
  return {
    success: true,
    sessionToken: sessionData.sessionToken,
    specialist: {
      id: specialist.id,
      firstName: specialist.firstName,
      lastName: specialist.lastName,
      phone: specialist.phone,
      verified: specialist.verified,
      subscriptionTier: specialist.subscriptionTier as 'FREE' | 'PREMIUM',
      createdAt: specialist.createdAt,
      updatedAt: specialist.updatedAt
    },
    isNewUser: true,
    requiresProfileCompletion: true
  }
}

async function registerWithSocial(request: RegistrationRequest): Promise<AuthResponse> {
  const { socialData } = request
  
  if (!socialData) {
    return {
      success: false,
      error: 'Данные социального аккаунта не предоставлены'
    }
  }
  
  // Проверяем, не зарегистрирован ли уже этот социальный аккаунт
  const existingAccount = await prisma.socialAccount.findFirst({
    where: {
      provider: socialData.provider,
      providerId: socialData.providerId
    },
    include: {
      specialist: true
    }
  })
  
  if (existingAccount) {
    // Если аккаунт уже существует, создаём сессию
    const sessionData = await createSession(existingAccount.specialistId)
    
    return {
      success: true,
      sessionToken: sessionData.sessionToken,
      specialist: {
        id: existingAccount.specialist.id,
        firstName: existingAccount.specialist.firstName,
        lastName: existingAccount.specialist.lastName,
        phone: existingAccount.specialist.phone,
        email: existingAccount.specialist.email,
        verified: existingAccount.specialist.verified,
        subscriptionTier: existingAccount.specialist.subscriptionTier as 'FREE' | 'PREMIUM',
        createdAt: existingAccount.specialist.createdAt,
        updatedAt: existingAccount.specialist.updatedAt
      },
      isNewUser: false
    }
  }
  
  // Извлекаем данные из социального профиля
  const extractedData = extractSocialData(socialData.provider, socialData.rawData || {})
  
  // Создаём специалиста
  const specialist = await prisma.specialist.create({
    data: {
      firstName: extractedData.firstName || extractedData.name || 'Новый',
      lastName: extractedData.lastName || 'Специалист',
      email: extractedData.email,
      avatar: extractedData.picture,
      phone: extractedData.phone,
      slug: await generateUniqueSlug(
        (extractedData.firstName || 'new') + '-' + (extractedData.lastName || 'specialist')
      ),
      category: 'other',
      specializations: ['Специалист'],
      about: 'Профиль будет заполнен позже',
      workFormats: ['online'],
      verified: false,
      acceptingClients: false
    }
  })
  
  // Создаём социальный аккаунт
  await prisma.socialAccount.create({
    data: {
      specialistId: specialist.id,
      provider: socialData.provider,
      providerId: socialData.providerId,
      email: extractedData.email,
      name: extractedData.name,
      picture: extractedData.picture,
      isPrimary: true,
      isVerified: true,
      rawData: socialData.rawData
    }
  })
  
  // Создаём сессию
  const sessionData = await createSession(specialist.id)
  
  debugLog('Социальная регистрация завершена', { specialistId: specialist.id })
  
  return {
    success: true,
    sessionToken: sessionData.sessionToken,
    specialist: {
      id: specialist.id,
      firstName: specialist.firstName,
      lastName: specialist.lastName,
      phone: specialist.phone,
      email: specialist.email,
      avatar: specialist.avatar,
      verified: specialist.verified,
      subscriptionTier: specialist.subscriptionTier as 'FREE' | 'PREMIUM',
      createdAt: specialist.createdAt,
      updatedAt: specialist.updatedAt
    },
    isNewUser: true,
    requiresProfileCompletion: true
  }
}

// ========================================
// ВХОД
// ========================================

export async function loginSpecialist(request: LoginRequest): Promise<AuthResponse> {
  try {
    debugLog('Начало входа', { provider: request.provider })
    
    if (request.provider === 'phone') {
      return await loginWithPhone(request)
    } else {
      return await loginWithSocial(request)
    }
    
  } catch (error) {
    debugLog('Ошибка входа', error)
    return {
      success: false,
      error: 'Произошла ошибка при входе'
    }
  }
}

async function loginWithPhone(request: LoginRequest): Promise<AuthResponse> {
  const { phone, code } = request
  
  if (!phone || !code) {
    return {
      success: false,
      error: 'Необходимо указать номер телефона и код подтверждения'
    }
  }
  
  const normalizedPhone = normalizePhone(phone)
  
  // Проверяем код
  const verification = await verifySMSCode({
    phone: normalizedPhone,
    code,
    purpose: 'login'
  })
  
  if (!verification.success) {
    return {
      success: false,
      error: verification.error
    }
  }
  
  // Ищем специалиста
  const specialist = await prisma.specialist.findFirst({
    where: { phone: normalizedPhone }
  })
  
  if (!specialist) {
    return {
      success: false,
      error: 'Специалист с таким номером телефона не найден',
      errorCode: AUTH_ERRORS.SESSION_INVALID
    }
  }
  
  // Создаём сессию
  const sessionData = await createSession(specialist.id)
  
  debugLog('Вход завершён', { specialistId: specialist.id })
  
  return {
    success: true,
    sessionToken: sessionData.sessionToken,
    specialist: {
      id: specialist.id,
      firstName: specialist.firstName,
      lastName: specialist.lastName,
      phone: specialist.phone,
      email: specialist.email,
      avatar: specialist.avatar,
      verified: specialist.verified,
      subscriptionTier: specialist.subscriptionTier as 'FREE' | 'PREMIUM',
      createdAt: specialist.createdAt,
      updatedAt: specialist.updatedAt
    },
    isNewUser: false
  }
}

async function loginWithSocial(request: LoginRequest): Promise<AuthResponse> {
  const { socialData } = request
  
  if (!socialData) {
    return {
      success: false,
      error: 'Данные социального аккаунта не предоставлены'
    }
  }
  
  // Ищем существующий социальный аккаунт
  const socialAccount = await prisma.socialAccount.findFirst({
    where: {
      provider: socialData.provider,
      providerId: socialData.providerId
    },
    include: {
      specialist: true
    }
  })
  
  if (!socialAccount) {
    return {
      success: false,
      error: 'Аккаунт не найден. Зарегистрируйтесь сначала'
    }
  }
  
  // Создаём сессию
  const sessionData = await createSession(socialAccount.specialistId)
  
  debugLog('Социальный вход завершён', { specialistId: socialAccount.specialistId })
  
  return {
    success: true,
    sessionToken: sessionData.sessionToken,
    specialist: {
      id: socialAccount.specialist.id,
      firstName: socialAccount.specialist.firstName,
      lastName: socialAccount.specialist.lastName,
      phone: socialAccount.specialist.phone,
      email: socialAccount.specialist.email,
      avatar: socialAccount.specialist.avatar,
      verified: socialAccount.specialist.verified,
      subscriptionTier: socialAccount.specialist.subscriptionTier as 'FREE' | 'PREMIUM',
      createdAt: socialAccount.specialist.createdAt,
      updatedAt: socialAccount.specialist.updatedAt
    },
    isNewUser: false
  }
}

// ========================================
// ОТПРАВКА SMS ДЛЯ РЕГИСТРАЦИИ/ВХОДА
// ========================================

export async function sendVerificationSMS(phone: string, purpose: 'registration' | 'login'): Promise<{
  success: boolean
  error?: string
}> {
  const normalizedPhone = normalizePhone(phone)
  
  // Валидируем телефон
  const phoneValidation = validatePhone(normalizedPhone)
  if (!phoneValidation.isValid) {
    return {
      success: false,
      error: phoneValidation.error
    }
  }
  
  // Для регистрации проверяем, что номер не занят
  if (purpose === 'registration') {
    const existingSpecialist = await prisma.specialist.findFirst({
      where: { phone: normalizedPhone }
    })
    
    if (existingSpecialist) {
      return {
        success: false,
        error: 'Специалист с таким номером телефона уже зарегистрирован'
      }
    }
  }
  
  // Отправляем SMS
  return await sendSMS({
    phone: normalizedPhone,
    purpose,
    testMode: process.env.NODE_ENV !== 'production'
  })
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
    const validation = await validateSession(sessionToken)
    
    if (!validation.valid || !validation.specialistId) {
      return {
        success: false,
        error: validation.error || 'Недействительная сессия'
      }
    }
    
    const specialist = await prisma.specialist.findUnique({
      where: { id: validation.specialistId }
    })
    
    if (!specialist) {
      return {
        success: false,
        error: 'Профиль не найден'
      }
    }
    
    return {
      success: true,
      profile: {
        id: specialist.id,
        firstName: specialist.firstName,
        lastName: specialist.lastName,
        phone: specialist.phone,
        email: specialist.email,
        avatar: specialist.avatar,
        verified: specialist.verified,
        subscriptionTier: specialist.subscriptionTier as 'FREE' | 'PREMIUM',
        createdAt: specialist.createdAt,
        updatedAt: specialist.updatedAt
      }
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

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = generateSlug(baseSlug)
  let counter = 1
  
  while (true) {
    const existing = await prisma.specialist.findUnique({
      where: { slug }
    })
    
    if (!existing) {
      return slug
    }
    
    slug = `${generateSlug(baseSlug)}-${counter}`
    counter++
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
