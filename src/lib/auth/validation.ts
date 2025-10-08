/**
 * Централизованная валидация для системы авторизации
 */

import { z } from 'zod'
import { AUTH_ERRORS } from './types'

// ========================================
// СХЕМЫ ВАЛИДАЦИИ
// ========================================

export const PhoneSchema = z.string()
  .min(1, 'Номер телефона обязателен')
  .regex(/^\+7\d{10}$/, 'Номер телефона должен начинаться с +7 и содержать 10 цифр')

export const SMSCodeSchema = z.string()
  .min(1, 'Код обязателен')
  .regex(/^\d{4}$/, 'Код должен содержать 4 цифры')

export const AuthPurposeSchema = z.enum(['registration', 'login', 'recovery'])

export const AuthProviderSchema = z.enum(['phone', 'google', 'vk', 'yandex', 'whatsapp', 'telegram'])

// ========================================
// СХЕМЫ ДЛЯ API
// ========================================

export const SendSMSSchema = z.object({
  phone: PhoneSchema,
  purpose: AuthPurposeSchema
})

export const VerifySMSCodeSchema = z.object({
  phone: PhoneSchema,
  code: SMSCodeSchema,
  purpose: AuthPurposeSchema
})

export const RegistrationRequestSchema = z.object({
  provider: AuthProviderSchema,
  phone: PhoneSchema.optional(),
  code: SMSCodeSchema.optional(),
  socialData: z.object({
    provider: AuthProviderSchema,
    providerId: z.string(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    picture: z.string().url().optional(),
    phone: PhoneSchema.optional(),
    rawData: z.record(z.string(), z.any()).optional()
  }).optional(),
  profile: z.record(z.string(), z.any()).optional()
}).refine(
  (data) => {
    if (data.provider === 'phone') {
      return data.phone && data.code
    }
    return data.socialData
  },
  {
    message: 'Для телефонной авторизации нужны phone и code, для социальной - socialData',
    path: ['provider']
  }
)

export const LoginRequestSchema = z.object({
  provider: AuthProviderSchema,
  phone: PhoneSchema.optional(),
  code: SMSCodeSchema.optional(),
  socialData: z.object({
    provider: AuthProviderSchema,
    providerId: z.string(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    picture: z.string().url().optional(),
    phone: PhoneSchema.optional(),
    rawData: z.record(z.string(), z.any()).optional()
  }).optional(),
  rememberMe: z.boolean().optional()
}).refine(
  (data) => {
    if (data.provider === 'phone') {
      return data.phone && data.code
    }
    return data.socialData
  },
  {
    message: 'Для телефонной авторизации нужны phone и code, для социальной - socialData',
    path: ['provider']
  }
)

// ========================================
// ФУНКЦИИ ВАЛИДАЦИИ
// ========================================

export function validatePhone(phone: string) {
  try {
    PhoneSchema.parse(phone)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        error: error.issues[0]?.message || 'Неверный формат телефона' 
      }
    }
    return { isValid: false, error: 'Ошибка валидации телефона' }
  }
}

export function validateSMSCode(code: string) {
  try {
    SMSCodeSchema.parse(code)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        error: error.issues[0]?.message || 'Неверный формат кода' 
      }
    }
    return { isValid: false, error: 'Ошибка валидации кода' }
  }
}

export function validateSendSMSRequest(data: unknown) {
  try {
    return { 
      success: true, 
      data: SendSMSSchema.parse(data) 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.issues[0]?.message || 'Неверные данные запроса' 
      }
    }
    return { success: false, error: 'Ошибка валидации запроса' }
  }
}

export function validateRegistrationRequest(data: unknown) {
  try {
    return { 
      success: true, 
      data: RegistrationRequestSchema.parse(data) 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.issues[0]?.message || 'Неверные данные регистрации' 
      }
    }
    return { success: false, error: 'Ошибка валидации регистрации' }
  }
}

export function validateLoginRequest(data: unknown) {
  try {
    return { 
      success: true, 
      data: LoginRequestSchema.parse(data) 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.issues[0]?.message || 'Неверные данные входа' 
      }
    }
    return { success: false, error: 'Ошибка валидации входа' }
  }
}

// ========================================
// ТИПЫ ДЛЯ ЭКСПОРТА
// ========================================

export type SendSMSRequest = z.infer<typeof SendSMSSchema>
export type VerifySMSCodeRequest = z.infer<typeof VerifySMSCodeSchema>
export type ValidatedRegistrationRequest = z.infer<typeof RegistrationRequestSchema>
export type ValidatedLoginRequest = z.infer<typeof LoginRequestSchema>
