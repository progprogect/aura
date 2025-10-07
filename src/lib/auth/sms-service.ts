/**
 * Сервис для отправки SMS
 */

import { prisma } from '@/lib/db'
import { SMS_CONFIG, isTestPhone, getTestCode } from './config'
import { generateSMSCode, getExpiryTime, createAuthError, debugLog } from './utils'
import type { SMSRequest, SMSVerificationRequest } from './types'

// ========================================
// ОТПРАВКА SMS
// ========================================

export async function sendSMS(request: SMSRequest): Promise<{ success: boolean; error?: string }> {
  try {
    debugLog('Отправка SMS', { phone: request.phone, purpose: request.purpose })
    
    // Проверяем rate limiting
    const rateLimitCheck = await checkRateLimit(request.phone)
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: 'Превышен лимит отправки SMS. Попробуйте позже.'
      }
    }
    
    // Генерируем код
    const code = isTestPhone(request.phone) && getTestCode(request.phone) 
      ? getTestCode(request.phone)!
      : generateSMSCode()
    
    // Сохраняем код в базу
    await saveVerificationCode(request.phone, code, request.purpose)
    
    // Отправляем SMS
    if (request.testMode || isTestPhone(request.phone)) {
      // В тестовом режиме только логируем
      debugLog('SMS отправлен (тестовый режим)', { phone: request.phone, code })
      return { success: true }
    }
    
    const smsResult = await sendRealSMS(request.phone, code)
    
    if (!smsResult.success) {
      return {
        success: false,
        error: 'Не удалось отправить SMS. Попробуйте позже.'
      }
    }
    
    debugLog('SMS успешно отправлен', { phone: request.phone })
    return { success: true }
    
  } catch (error) {
    debugLog('Ошибка отправки SMS', error)
    return {
      success: false,
      error: 'Произошла ошибка при отправке SMS'
    }
  }
}

// ========================================
// ПРОВЕРКА КОДА
// ========================================

export async function verifySMSCode(request: SMSVerificationRequest): Promise<{
  success: boolean
  error?: string
  verificationId?: string
}> {
  try {
    debugLog('Проверка SMS кода', { phone: request.phone, purpose: request.purpose })
    
    // Ищем код в базе
    const verification = await prisma.sMSVerification.findFirst({
      where: {
        phone: request.phone,
        purpose: request.purpose,
        isUsed: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!verification) {
      return {
        success: false,
        error: 'Код не найден или уже использован'
      }
    }
    
    // Проверяем срок действия
    if (new Date() > verification.expiresAt) {
      return {
        success: false,
        error: 'Код истёк. Запросите новый код'
      }
    }
    
    // Проверяем количество попыток
    if (verification.attempts >= SMS_CONFIG.maxAttempts) {
      return {
        success: false,
        error: 'Превышено количество попыток ввода кода'
      }
    }
    
    // Проверяем код
    if (verification.code !== request.code) {
      // Увеличиваем количество попыток
      await prisma.sMSVerification.update({
        where: { id: verification.id },
        data: { attempts: verification.attempts + 1 }
      })
      
      return {
        success: false,
        error: 'Неверный код'
      }
    }
    
    // Помечаем код как использованный
    await prisma.sMSVerification.update({
      where: { id: verification.id },
      data: { 
        isUsed: true,
        usedAt: new Date()
      }
    })
    
    debugLog('SMS код успешно проверен', { phone: request.phone })
    return {
      success: true,
      verificationId: verification.id
    }
    
  } catch (error) {
    debugLog('Ошибка проверки SMS кода', error)
    return {
      success: false,
      error: 'Произошла ошибка при проверке кода'
    }
  }
}

// ========================================
// ВНУТРЕННИЕ ФУНКЦИИ
// ========================================

async function saveVerificationCode(phone: string, code: string, purpose: string): Promise<void> {
  // Удаляем старые неиспользованные коды для этого номера
  await prisma.sMSVerification.deleteMany({
    where: {
      phone,
      purpose,
      isUsed: false
    }
  })
  
  // Создаём новый код
  await prisma.sMSVerification.create({
    data: {
      phone,
      code,
      purpose,
      expiresAt: getExpiryTime(5) // 5 минут
    }
  })
}

async function checkRateLimit(phone: string): Promise<{ allowed: boolean; resetTime?: Date }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  const recentCodes = await prisma.sMSVerification.count({
    where: {
      phone,
      createdAt: {
        gte: oneHourAgo
      }
    }
  })
  
  // Максимум 3 SMS в час
  if (recentCodes >= 3) {
    const oldestCode = await prisma.sMSVerification.findFirst({
      where: {
        phone,
        createdAt: {
          gte: oneHourAgo
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    const resetTime = oldestCode ? new Date(oldestCode.createdAt.getTime() + 60 * 60 * 1000) : undefined
    
    return { allowed: false, resetTime }
  }
  
  return { allowed: true }
}

async function sendRealSMS(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (SMS_CONFIG.smsru.apiId) {
      return await sendSMSru(phone, code)
    }
    
    // Fallback - логируем и возвращаем успех в dev режиме
    debugLog('SMS провайдер не настроен, используем mock', { phone, code })
    return { success: true }
    
  } catch (error) {
    debugLog('Ошибка отправки реального SMS', error)
    return {
      success: false,
      error: 'Ошибка SMS провайдера'
    }
  }
}

async function sendSMSru(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const params = new URLSearchParams({
      api_id: SMS_CONFIG.smsru.apiId!,
      to: phone,
      msg: `Ваш код для входа в Аура: ${code}. Никому не сообщайте этот код.`,
      from: SMS_CONFIG.smsru.sender,
      test: SMS_CONFIG.smsru.test ? '1' : '0'
    })
    
    const response = await fetch(SMS_CONFIG.smsru.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })
    
    const result = await response.text()
    
    // SMS.ru возвращает ответ в формате: код\nбаланс
    const lines = result.split('\n')
    const statusCode = lines[0]
    
    if (statusCode === '100') {
      return { success: true }
    } else {
      const errorMessage = getSMSruErrorMessage(statusCode)
      return {
        success: false,
        error: errorMessage
      }
    }
    
  } catch (error) {
    debugLog('Ошибка SMS.ru API', error)
    return {
      success: false,
      error: 'Ошибка соединения с SMS сервисом'
    }
  }
}

function getSMSruErrorMessage(code: string): string {
  const errors: Record<string, string> = {
    '200': 'Неправильный api_id',
    '201': 'Не хватает средств на лицевом счету',
    '202': 'Неправильно указан получатель',
    '203': 'Нет текста сообщения',
    '204': 'Имя отправителя не согласовано с администрацией',
    '205': 'Сообщение слишком длинное',
    '206': 'Будет превышен или уже превышен дневной лимит на отправку SMS',
    '207': 'На этот номер (или один из номеров) нельзя отправлять SMS',
    '208': 'Параметр time указан неправильно',
    '209': 'Вы добавили этот номер (или один из номеров) в стоп-лист',
    '210': 'Используется GET, где необходимо использовать POST',
    '211': 'Метод не найден',
    '212': 'Текст сообщения необходимо передать в кодировке UTF-8',
    '213': 'Указано более 100 номеров получателей',
    '220': 'Сервис временно недоступен',
    '230': 'Превышен общий лимит количества сообщений на этот номер в день',
    '231': 'Превышен лимит одинаковых сообщений на этот номер в минуту',
    '232': 'Превышен лимит одинаковых сообщений на этот номер в день',
    '300': 'Неправильный token',
    '301': 'Неправильный api_id',
    '302': 'В Российской Федерации для отправки SMS на номера федеральных операторов необходимо указывать отправителя'
  }
  
  return errors[code] || `Неизвестная ошибка SMS.ru (код: ${code})`
}

// ========================================
// УТИЛИТЫ
// ========================================

export async function cleanupExpiredCodes(): Promise<void> {
  try {
    const result = await prisma.sMSVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    
    debugLog('Очистка истёкших кодов', { deleted: result.count })
  } catch (error) {
    debugLog('Ошибка очистки истёкших кодов', error)
  }
}

export async function getVerificationStatus(phone: string, purpose: string): Promise<{
  hasActiveCode: boolean
  attemptsLeft: number
  expiresAt?: Date
}> {
  try {
    const verification = await prisma.sMSVerification.findFirst({
      where: {
        phone,
        purpose,
        isUsed: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!verification) {
      return {
        hasActiveCode: false,
        attemptsLeft: 0
      }
    }
    
    return {
      hasActiveCode: new Date() < verification.expiresAt,
      attemptsLeft: Math.max(0, SMS_CONFIG.maxAttempts - verification.attempts),
      expiresAt: verification.expiresAt
    }
    
  } catch (error) {
    debugLog('Ошибка получения статуса верификации', error)
    return {
      hasActiveCode: false,
      attemptsLeft: 0
    }
  }
}
