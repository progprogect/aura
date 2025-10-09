/**
 * Единый сервис авторизации (Unified Auth)
 * Обрабатывает вход и регистрацию для всех типов пользователей
 */

import { prisma } from '@/lib/db'
import { SMSVerificationService } from './business-logic'
import { generateSessionToken, normalizePhone } from './utils'

export type UserRole = 'user' | 'specialist'

export interface UnifiedLoginData {
  phone: string
  code: string
  role?: UserRole // Опционально для совместимости
}

export interface UnifiedRegisterData {
  phone: string
  code: string
  role: UserRole
  firstName?: string
  lastName?: string
  // Дополнительные поля для специалистов (будут в отдельном шаге)
}

export interface UnifiedAuthResponse {
  success: boolean
  sessionToken?: string
  user?: {
    id: string
    firstName: string
    lastName: string
    phone: string
    email?: string
    avatar?: string
    hasSpecialistProfile: boolean
    specialistProfileSlug?: string
    specialistProfileId?: string
  }
  error?: string
}

// ========================================
// ЕДИНЫЙ ВХОД
// ========================================

export async function unifiedLogin(data: UnifiedLoginData): Promise<UnifiedAuthResponse> {
  const { phone, code, role } = data
  
  try {
    console.log(`[unified-auth] Вход: ${phone}, роль: ${role || 'auto'}`)
    
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
    
    // 3. Если роль указана - проверяем её, иначе входим как есть
    if (role && role === 'specialist' && !user.specialistProfile) {
      return {
        success: false,
        error: 'Профиль специалиста не найден. Пожалуйста, зарегистрируйтесь как специалист'
      }
    }
    
    // 4. Создаём сессию
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
    
    console.log(`[unified-auth] Вход успешен: ${user.id}`)
    
    return {
      success: true,
      sessionToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email || undefined,
        avatar: user.avatar || undefined,
        hasSpecialistProfile: !!user.specialistProfile,
        specialistProfileSlug: user.specialistProfile?.slug,
        specialistProfileId: user.specialistProfile?.id
      }
    }
    
  } catch (error) {
    console.error('[unified-auth] Ошибка входа:', error)
    return {
      success: false,
      error: 'Произошла ошибка при входе'
    }
  }
}

// ========================================
// ЕДИНАЯ РЕГИСТРАЦИЯ
// ========================================

export async function unifiedRegister(data: UnifiedRegisterData): Promise<UnifiedAuthResponse> {
  const { phone, code, role, firstName, lastName } = data
  
  try {
    console.log(`[unified-auth] Регистрация: ${phone}, роль: ${role}`)
    
    // 1. Проверяем SMS-код
    const verification = await SMSVerificationService.verifyCode(phone, code, 'registration')
    if (!verification.success) {
      return {
        success: false,
        error: verification.error
      }
    }
    
    const normalizedPhone = normalizePhone(phone)
    
    // 2. Проверяем что пользователь не существует
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    })
    
    if (existingUser) {
      return {
        success: false,
        error: 'Пользователь с таким номером уже существует'
      }
    }
    
    // 3. Создаём пользователя
    const user = await prisma.user.create({
      data: {
        firstName: firstName || 'Пользователь',
        lastName: lastName || '',
        phone: normalizedPhone
      }
    })
    
    // 4. Если роль specialist - создаём профиль специалиста
    let createdSlug: string | undefined
    if (role === 'specialist') {
      // Генерируем уникальный slug
      const baseSlug = `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`.replace(/\s+/g, '-')
      let slug = baseSlug
      let counter = 1
      
      while (await prisma.specialistProfile.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
      
      await prisma.specialistProfile.create({
        data: {
          userId: user.id,
          slug,
          category: 'other',
          specializations: [],
          about: '',
          workFormats: ['online'],
          verified: false,
          acceptingClients: false
        }
      })
      
      createdSlug = slug
    }
    
    // 5. Создаём сессию
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
    
    console.log(`[unified-auth] Регистрация успешна: ${user.id}`)
    
    return {
      success: true,
      sessionToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email || undefined,
        avatar: user.avatar || undefined,
        hasSpecialistProfile: role === 'specialist',
        specialistProfileSlug: createdSlug
      }
    }
    
  } catch (error) {
    console.error('[unified-auth] Ошибка регистрации:', error)
    return {
      success: false,
      error: 'Произошла ошибка при регистрации'
    }
  }
}

// ========================================
// ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ СЕССИИ
// ========================================

export async function getUnifiedUserFromSession(sessionToken: string) {
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
      email: session.user.email || undefined,
      avatar: session.user.avatar || undefined,
      hasSpecialistProfile: !!session.user.specialistProfile,
      specialistProfileSlug: session.user.specialistProfile?.slug,
      specialistProfileId: session.user.specialistProfile?.id
    }
    
  } catch (error) {
    console.error('[unified-auth] Ошибка получения пользователя:', error)
    return null
  }
}

// ========================================
// ВЫХОД
// ========================================

export async function unifiedLogout(sessionToken: string): Promise<boolean> {
  try {
    await prisma.authSession.updateMany({
      where: { sessionToken },
      data: { isActive: false }
    })
    
    console.log('[unified-auth] Выход выполнен')
    return true
    
  } catch (error) {
    console.error('[unified-auth] Ошибка выхода:', error)
    return false
  }
}
