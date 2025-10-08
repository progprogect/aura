/**
 * Рефакторированный SMS сервис
 */

import { SMSVerificationService } from './business-logic'
import { normalizePhone, generateSMSCode, debugLog } from './utils'
import { AUTH_CONFIG } from './config'
import type { SMSRequest, SMSVerificationRequest } from './types'

// ========================================
// ОТПРАВКА SMS
// ========================================

export async function sendSMS(request: SMSRequest): Promise<{ success: boolean; error?: string; code?: string }> {
  try {
    debugLog('Отправка SMS', { phone: request.phone, purpose: request.purpose })
    
    const normalizedPhone = normalizePhone(request.phone)
    
    // Генерируем код
    const code = generateSMSCode()
    
    // Сохраняем код в базу
    await SMSVerificationService.saveVerificationCode(normalizedPhone, code, request.purpose)
    
    // УПРОЩЁННАЯ ВЕРСИЯ: Всегда выводим код в консоль
    // В будущем здесь будет настоящая отправка SMS
    console.log(`\n🔐 SMS КОД для ${normalizedPhone}: ${code}\n`)
    console.log(`📱 Используйте этот код для ${request.purpose === 'login' ? 'входа' : 'регистрации'}\n`)
    
    return {
      success: true,
      code // Возвращаем код для показа в UI
    }
    
  } catch (error) {
    debugLog('Ошибка отправки SMS', error)
    return {
      success: false,
      error: 'Не удалось отправить SMS'
    }
  }
}

// ========================================
// ПРОВЕРКА SMS КОДА
// ========================================

export async function verifySMSCode(request: SMSVerificationRequest): Promise<{
  success: boolean
  error?: string
  verificationId?: string
}> {
  try {
    debugLog('Проверка SMS кода', { phone: request.phone })
    
    const result = await SMSVerificationService.verifyCode(
      request.phone,
      request.code,
      request.purpose
    )
    
    return result
    
  } catch (error) {
    debugLog('Ошибка проверки SMS кода', error)
    return {
      success: false,
      error: 'Произошла ошибка при проверке кода'
    }
  }
}

// ========================================
// ОТПРАВКА ТЕСТОВОГО SMS
// ========================================

async function sendTestSMS(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  // В тестовом режиме просто логируем код
  console.log(`[TEST SMS] Код для ${phone}: ${code}`)
  
  // Проверяем тестовые номера
  const testPhones = AUTH_CONFIG.testMode.testPhones as Record<string, string>
  const testCode = testPhones[phone]
  
  if (testCode) {
    console.log(`[TEST SMS] Используйте код: ${testCode}`)
  }
  
  debugLog('Тестовый SMS отправлен', { phone, code })
  
  return {
    success: true
  }
}

// ========================================
// ОТПРАВКА РЕАЛЬНОГО SMS
// ========================================

async function sendRealSMS(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  const provider = AUTH_CONFIG.sms.provider
  
  switch (provider) {
    case 'smsru':
      return await sendSMSViaSMSRu(phone, code)
    case 'twilio':
      return await sendSMSViaTwilio(phone, code)
    default:
      debugLog('SMS провайдер не настроен', { provider })
      return {
        success: false,
        error: 'SMS провайдер не настроен'
      }
  }
}

// ========================================
// SMS.RU ПРОВАЙДЕР
// ========================================

async function sendSMSViaSMSRu(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const apiId = AUTH_CONFIG.sms.smsRuApiId
    
    if (!apiId) {
      throw new Error('SMS.ru API ID не настроен')
    }
    
    const message = `Ваш код для входа в Аура: ${code}. Код действителен 5 минут.`
    
    // Здесь должен быть реальный запрос к SMS.ru API
    // const response = await fetch(`https://sms.ru/sms/send?api_id=${apiId}&to=${phone}&msg=${encodeURIComponent(message)}`)
    // const result = await response.json()
    
    // Для демонстрации просто логируем
    console.log(`[SMS.RU] Отправка на ${phone}: ${message}`)
    
    debugLog('SMS отправлен через SMS.ru', { phone })
    
    return {
      success: true
    }
    
  } catch (error) {
    debugLog('Ошибка отправки через SMS.ru', error)
    return {
      success: false,
      error: 'Ошибка отправки SMS через SMS.ru'
    }
  }
}

// ========================================
// TWILIO ПРОВАЙДЕР
// ========================================

async function sendSMSViaTwilio(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Здесь должна быть интеграция с Twilio
    // const twilio = require('twilio')
    // const client = twilio(accountSid, authToken)
    
    console.log(`[TWILIO] Отправка на ${phone}: код ${code}`)
    
    debugLog('SMS отправлен через Twilio', { phone })
    
    return {
      success: true
    }
    
  } catch (error) {
    debugLog('Ошибка отправки через Twilio', error)
    return {
      success: false,
      error: 'Ошибка отправки SMS через Twilio'
    }
  }
}
