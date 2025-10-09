/**
 * Бизнес-логика для системы авторизации
 * Только SMS Verification Service (остальное перенесено в unified services)
 */

import { prisma } from '@/lib/db'
import { normalizePhone } from './utils'

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

// ========================================
// СОЦИАЛЬНАЯ АВТОРИЗАЦИЯ (LEGACY STUB)
// ========================================

export class SocialAuthService {
  /**
   * Заглушка для социальной авторизации
   * TODO: Реализовать unified social auth
   */
  static async handleCallback() {
    throw new Error('Social auth not implemented in unified system yet')
  }
}

