/**
 * Unified Auth Service для обычных пользователей
 * Простая регистрация/вход для всех пользователей
 */

import { prisma } from '@/lib/db'
import { normalizePhone, debugLog, generateSessionToken } from './utils'
import { SMSVerificationService } from './business-logic'
import type { AuthResponse } from './types'

// ========================================
// ТИПЫ
// ========================================

interface RegisterUserData {
  phone: string
  code: string
  firstName: string
  lastName: string
}

interface LoginUserData {
  phone: string
  code: string
}

// ========================================
// РЕГИСТРАЦИЯ ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
// ========================================

export async function registerUser(data: RegisterUserData): Promise<AuthResponse> {
  const { phone, code, firstName, lastName } = data
  
  try {
    debugLog('Начало регистрации пользователя', { phone })
    
    // 1. Проверяем SMS-код
    const verification = await SMSVerificationService.verifyCode(phone, code, 'registration')
    if (!verification.success) {
      return {
        success: false,
        error: verification.error
      }
    }
    
    const normalizedPhone = normalizePhone(phone)
    
    // 2. Проверяем, не зарегистрирован ли уже этот номер
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    })
    
    if (existingUser) {
      return {
        success: false,
        error: 'Пользователь с таким номером уже зарегистрирован'
      }
    }
    
    // 3. Создаём пользователя
    const user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        firstName,
        lastName
      }
    })
    
    // 4. Создаём сессию
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
    
    debugLog('Регистрация пользователя завершена', { userId: user.id })
    
    return {
      success: true,
      sessionToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        hasSpecialistProfile: false
      }
    }
    
  } catch (error) {
    console.error('[user-auth-service] Ошибка регистрации:', error)
    debugLog('Ошибка регистрации пользователя', error)
    return {
      success: false,
      error: 'Произошла ошибка при регистрации'
    }
  }
}

// ========================================
// ВХОД ОБЫЧНОГО ПОЛЬЗОВАТЕЛЯ
// ========================================

export async function loginUser(data: LoginUserData): Promise<AuthResponse> {
  const { phone, code } = data
  
  try {
    debugLog('Начало входа пользователя', { phone })
    
    // 1. Проверяем SMS-код
    const verification = await SMSVerificationService.verifyCode(phone, code, 'login')
    if (!verification.success) {
      return {
        success: false,
        error: verification.error
      }
    }
    
    const normalizedPhone = normalizePhone(phone)
    
    // 2. Ищем пользователя
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: {
        specialistProfile: {
          select: {
            id: true,
            slug: true
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
    
    // 3. Создаём новую сессию
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
    
    debugLog('Вход пользователя завершён', { userId: user.id })
    
    return {
      success: true,
      sessionToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar,
        hasSpecialistProfile: !!user.specialistProfile,
        specialistProfileSlug: user.specialistProfile?.slug
      }
    }
    
  } catch (error) {
    console.error('[user-auth-service] Ошибка входа:', error)
    debugLog('Ошибка входа пользователя', error)
    return {
      success: false,
      error: 'Произошла ошибка при входе'
    }
  }
}

// ========================================
// ПОЛУЧЕНИЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
// ========================================

export async function getUserFromSession(sessionToken: string) {
  try {
    const session = await prisma.authSession.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: {
            specialistProfile: {
              select: {
                id: true,
                slug: true,
                verified: true
              }
            }
          }
        }
      }
    })
    
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return null
    }
    
    // Обновляем время последнего использования
    await prisma.authSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() }
    })
    
    return {
      id: session.user.id,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      phone: session.user.phone,
      email: session.user.email,
      avatar: session.user.avatar,
      hasSpecialistProfile: !!session.user.specialistProfile,
      specialistProfileSlug: session.user.specialistProfile?.slug,
      specialistProfileId: session.user.specialistProfile?.id
    }
    
  } catch (error) {
    console.error('[user-auth-service] Ошибка получения пользователя:', error)
    return null
  }
}

// ========================================
// ВЫХОД
// ========================================

export async function logoutUser(sessionToken: string): Promise<boolean> {
  try {
    await prisma.authSession.updateMany({
      where: { sessionToken },
      data: { isActive: false }
    })
    return true
  } catch (error) {
    console.error('[user-auth-service] Ошибка выхода:', error)
    return false
  }
}

