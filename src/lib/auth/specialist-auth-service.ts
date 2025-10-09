/**
 * Unified Auth Service для специалистов
 * Создаёт User + SpecialistProfile при регистрации
 */

import { prisma } from '@/lib/db'
import { normalizePhone, debugLog, generateSessionToken } from './utils'
import { SMSVerificationService } from './business-logic'
import type { AuthResponse } from './types'

// ========================================
// ТИПЫ
// ========================================

interface RegisterSpecialistData {
  phone: string
  code: string
}

// ========================================
// РЕГИСТРАЦИЯ СПЕЦИАЛИСТА (Unified)
// ========================================

export async function registerSpecialistUnified(data: RegisterSpecialistData): Promise<AuthResponse> {
  const { phone, code } = data
  
  try {
    debugLog('Начало регистрации специалиста (unified)', { phone })
    
    // 1. Проверяем SMS-код
    const verification = await SMSVerificationService.verifyCode(phone, code, 'registration')
    if (!verification.success) {
      return {
        success: false,
        error: verification.error
      }
    }
    
    const normalizedPhone = normalizePhone(phone)
    
    // 2. Проверяем, не существует ли уже пользователь с этим номером
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: {
        specialistProfile: {
          select: { id: true }
        }
      }
    })
    
    // Если пользователь существует и уже является специалистом
    if (existingUser?.specialistProfile) {
      return {
        success: false,
        error: 'Вы уже зарегистрированы как специалист'
      }
    }
    
    let user
    
    // Если пользователь существует, но ещё не специалист
    if (existingUser) {
      user = existingUser
      debugLog('Пользователь существует, добавляем профиль специалиста', { userId: user.id })
    } else {
      // Создаём нового пользователя
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          // Имя и фамилия будут заполнены при онбординге
          firstName: '',
          lastName: ''
        }
      })
      debugLog('Создан новый пользователь', { userId: user.id })
    }
    
    // 3. Генерируем уникальный slug
    const baseSlug = 'new-specialist'
    const slug = await generateUniqueSlug(baseSlug)
    
    // 4. Создаём профиль специалиста
    const specialistProfile = await prisma.specialistProfile.create({
      data: {
        userId: user.id,
        slug,
        category: 'other', // Будет заполнено при онбординге
        specializations: ['Специалист'],
        about: '', // Будет заполнено при онбординге
        workFormats: ['online'],
        verified: false,
        acceptingClients: false
      }
    })
    
    debugLog('Создан профиль специалиста', { specialistProfileId: specialistProfile.id })
    
    // 5. Создаём сессию
    const sessionToken = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 дней
    
    await prisma.authSession.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt,
        isActive: true
      }
    })
    
    debugLog('Регистрация специалиста завершена', { userId: user.id, specialistProfileId: specialistProfile.id })
    
    return {
      success: true,
      sessionToken,
      user: {
        id: user.id,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        hasSpecialistProfile: true,
        specialistProfileSlug: specialistProfile.slug,
        specialistProfileId: specialistProfile.id
      },
      requiresProfileCompletion: true
    }
    
  } catch (error) {
    console.error('[specialist-auth-service] Ошибка регистрации:', error)
    debugLog('Ошибка регистрации специалиста', error)
    return {
      success: false,
      error: 'Произошла ошибка при регистрации'
    }
  }
}

// ========================================
// ВХОД СПЕЦИАЛИСТА (Unified)
// ========================================

export async function loginSpecialistUnified(data: RegisterSpecialistData): Promise<AuthResponse> {
  const { phone, code } = data
  
  try {
    debugLog('Начало входа специалиста (unified)', { phone })
    
    // 1. Проверяем SMS-код
    const verification = await SMSVerificationService.verifyCode(phone, code, 'login')
    if (!verification.success) {
      return {
        success: false,
        error: verification.error
      }
    }
    
    const normalizedPhone = normalizePhone(phone)
    
    // 2. Ищем пользователя с профилем специалиста
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: {
        specialistProfile: {
          select: {
            id: true,
            slug: true,
            verified: true
          }
        }
      }
    })
    
    if (!user) {
      return {
        success: false,
        error: 'Пользователь не найден. Пожалуйста, зарегистрируйтесь'
      }
    }
    
    if (!user.specialistProfile) {
      return {
        success: false,
        error: 'Профиль специалиста не найден. Пожалуйста, зарегистрируйтесь как специалист'
      }
    }
    
    // 3. Создаём новую сессию
    const sessionToken = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    
    await prisma.authSession.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt,
        isActive: true
      }
    })
    
    debugLog('Вход специалиста завершён', { userId: user.id })
    
    return {
      success: true,
      sessionToken,
      user: {
        id: user.id,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        hasSpecialistProfile: true,
        specialistProfileSlug: user.specialistProfile.slug,
        specialistProfileId: user.specialistProfile.id
      }
    }
    
  } catch (error) {
    console.error('[specialist-auth-service] Ошибка входа:', error)
    debugLog('Ошибка входа специалиста', error)
    return {
      success: false,
      error: 'Произошла ошибка при входе'
    }
  }
}

// ========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const existing = await prisma.specialistProfile.findUnique({
      where: { slug }
    })
    
    if (!existing) {
      return slug
    }
    
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

