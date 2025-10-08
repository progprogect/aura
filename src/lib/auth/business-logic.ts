/**
 * Бизнес-логика для системы авторизации
 */

import { prisma } from '@/lib/db'
import { normalizePhone } from './utils'
import type { AuthProvider } from './types'

// ========================================
// РАБОТА СО СПЕЦИАЛИСТАМИ
// ========================================

export class SpecialistService {
  /**
   * Создание нового специалиста с минимальными данными
   */
  static async createSpecialist(phone: string, socialData?: any) {
    const normalizedPhone = normalizePhone(phone)
    
    // Генерируем уникальный slug
    const baseSlug = socialData?.name ? 
      this.generateSlugFromName(socialData.name) : 
      'new-specialist'
    
    const slug = await this.generateUniqueSlug(baseSlug)
    
    // Извлекаем данные из социального профиля если есть
    const firstName = socialData?.firstName || socialData?.name?.split(' ')[0] || 'Новый'
    const lastName = socialData?.lastName || socialData?.name?.split(' ')[1] || 'Специалист'
    const email = socialData?.email
    const avatar = socialData?.picture
    
    return prisma.specialist.create({
      data: {
        firstName,
        lastName,
        email,
        avatar,
        phone: normalizedPhone,
        slug,
        category: 'other',
        specializations: ['Специалист'],
        about: 'Профиль будет заполнен позже',
        workFormats: ['online'],
        verified: false,
        acceptingClients: false
      }
    })
  }
  
  /**
   * Поиск специалиста по номеру телефона
   */
  static async findByPhone(phone: string) {
    const normalizedPhone = normalizePhone(phone)
    return prisma.specialist.findFirst({
      where: { phone: normalizedPhone }
    })
  }
  
  /**
   * Проверка существования специалиста по номеру
   */
  static async existsByPhone(phone: string): Promise<boolean> {
    const specialist = await this.findByPhone(phone)
    return !!specialist
  }
  
  /**
   * Генерация slug из имени
   */
  private static generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  
  /**
   * Генерация уникального slug
   */
  private static async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug
    let counter = 1
    
    while (true) {
      const existing = await prisma.specialist.findUnique({
        where: { slug }
      })
      
      if (!existing) {
        return slug
      }
      
      slug = `${baseSlug}-${counter}`
      counter++
    }
  }
}

// ========================================
// РАБОТА С СОЦИАЛЬНЫМИ АККАУНТАМИ
// ========================================

export class SocialAccountService {
  /**
   * Создание социального аккаунта
   */
  static async createAccount(specialistId: string, socialData: any) {
    return prisma.socialAccount.create({
      data: {
        specialistId,
        provider: socialData.provider,
        providerId: socialData.providerId,
        email: socialData.email,
        name: socialData.name,
        picture: socialData.picture,
        isPrimary: true,
        isVerified: true,
        rawData: socialData.rawData
      }
    })
  }
  
  /**
   * Поиск социального аккаунта
   */
  static async findByProvider(provider: AuthProvider, providerId: string) {
    return prisma.socialAccount.findFirst({
      where: {
        provider,
        providerId
      },
      include: {
        specialist: true
      }
    })
  }
  
  /**
   * Проверка существования социального аккаунта
   */
  static async existsByProvider(provider: AuthProvider, providerId: string): Promise<boolean> {
    const account = await this.findByProvider(provider, providerId)
    return !!account
  }
}

// ========================================
// РАБОТА С СЕССИЯМИ
// ========================================

export class SessionService {
  /**
   * Создание новой сессии
   */
  static async createSession(specialistId: string, metadata?: {
    userAgent?: string
    ipAddress?: string
    deviceFingerprint?: string
  }) {
    // Очищаем старые сессии перед созданием новой
    await this.cleanupOldSessions(specialistId)
    
    const sessionToken = this.generateSessionToken()
    const expiresAt = this.getSessionExpiryTime()
    
    return prisma.authSession.create({
      data: {
        specialistId,
        sessionToken,
        deviceFingerprint: metadata?.deviceFingerprint,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
        expiresAt,
        isActive: true
      }
    })
  }
  
  /**
   * Валидация и обновление сессии
   */
  static async validateAndUpdateSession(sessionToken: string) {
    const session = await prisma.authSession.findUnique({
      where: { sessionToken },
      include: {
        specialist: true
      }
    })
    
    if (!session || !session.isActive || this.isExpired(session.expiresAt)) {
      return { valid: false, session: null }
    }
    
    // Обновляем время последнего использования и продлеваем сессию
    const updatedSession = await prisma.authSession.update({
      where: { id: session.id },
      data: {
        lastUsedAt: new Date(),
        expiresAt: this.getSessionExpiryTime() // Продлеваем сессию
      },
      include: {
        specialist: true
      }
    })
    
    return { valid: true, session: updatedSession }
  }
  
  /**
   * Очистка старых сессий
   */
  private static async cleanupOldSessions(specialistId: string) {
    const maxSessions = 5 // Максимум 5 активных сессий
    
    const activeSessions = await prisma.authSession.findMany({
      where: {
        specialistId,
        isActive: true
      },
      orderBy: {
        lastUsedAt: 'desc'
      }
    })
    
    if (activeSessions.length >= maxSessions) {
      const sessionsToDeactivate = activeSessions.slice(maxSessions - 1)
      await prisma.authSession.updateMany({
        where: {
          id: {
            in: sessionsToDeactivate.map(s => s.id)
          }
        },
        data: {
          isActive: false
        }
      })
    }
  }
  
  /**
   * Генерация токена сессии
   */
  private static generateSessionToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  
  /**
   * Получение времени истечения сессии
   */
  private static getSessionExpiryTime(): Date {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
  }
  
  /**
   * Проверка истечения сессии
   */
  private static isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt
  }
}

// ========================================
// РАБОТА С SMS ВЕРИФИКАЦИЕЙ
// ========================================

export class SMSVerificationService {
  /**
   * Сохранение кода верификации
   */
  static async saveVerificationCode(phone: string, code: string, purpose: string) {
    const normalizedPhone = normalizePhone(phone)
    
    // Удаляем старые неиспользованные коды
    await prisma.sMSVerification.deleteMany({
      where: {
        phone: normalizedPhone,
        purpose,
        isUsed: false
      }
    })
    
    // Создаём новый код
    return prisma.sMSVerification.create({
      data: {
        phone: normalizedPhone,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 минут
      }
    })
  }
  
  /**
   * Проверка кода верификации
   */
  static async verifyCode(phone: string, code: string, purpose: string) {
    const normalizedPhone = normalizePhone(phone)
    
    const verification = await prisma.sMSVerification.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        isUsed: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!verification) {
      return { success: false, error: 'Код не найден или уже использован' }
    }
    
    // Проверяем срок действия
    if (new Date() > verification.expiresAt) {
      return { success: false, error: 'Код истёк. Запросите новый код' }
    }
    
    // Проверяем количество попыток
    if (verification.attempts >= 3) {
      return { success: false, error: 'Превышено количество попыток ввода кода' }
    }
    
    // Проверяем код
    if (verification.code !== code) {
      // Увеличиваем количество попыток
      await prisma.sMSVerification.update({
        where: { id: verification.id },
        data: { attempts: verification.attempts + 1 }
      })
      
      return { success: false, error: 'Неверный код' }
    }
    
    // Помечаем код как использованный
    await prisma.sMSVerification.update({
      where: { id: verification.id },
      data: { 
        isUsed: true,
        usedAt: new Date()
      }
    })
    
    return { success: true, verificationId: verification.id }
  }
}
