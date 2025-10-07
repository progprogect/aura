/**
 * Типы для системы авторизации специалистов
 */

// ========================================
// ОСНОВНЫЕ ТИПЫ АВТОРИЗАЦИИ
// ========================================

export type AuthProvider = 'phone' | 'google' | 'vk' | 'yandex' | 'whatsapp' | 'telegram'

export type AuthPurpose = 'registration' | 'login' | 'recovery'

export type SessionStatus = 'active' | 'expired' | 'revoked'

// ========================================
// ПРОВАЙДЕРЫ АВТОРИЗАЦИИ
// ========================================

export interface AuthProviderConfig {
  id: AuthProvider
  name: string
  icon: string
  color: string
  enabled: boolean
  priority: number
  description: string
  dataExtraction: string[]
}

export const AUTH_PROVIDERS: Record<AuthProvider, AuthProviderConfig> = {
  phone: {
    id: 'phone',
    name: 'Номер телефона',
    icon: '📱',
    color: '#10B981',
    enabled: true,
    priority: 1,
    description: 'Быстрая регистрация через SMS',
    dataExtraction: ['phone', 'name']
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '📲',
    color: '#25D366',
    enabled: true,
    priority: 2,
    description: 'Войти через WhatsApp',
    dataExtraction: ['phone', 'name', 'profile_picture']
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: '#0088CC',
    enabled: true,
    priority: 3,
    description: 'Войти через Telegram',
    dataExtraction: ['phone', 'username', 'first_name', 'last_name']
  },
  google: {
    id: 'google',
    name: 'Google',
    icon: '🔍',
    color: '#4285F4',
    enabled: true,
    priority: 4,
    description: 'Войти через Google',
    dataExtraction: ['email', 'name', 'picture']
  },
  vk: {
    id: 'vk',
    name: 'ВКонтакте',
    icon: '🔵',
    color: '#0077FF',
    enabled: true,
    priority: 5,
    description: 'Войти через ВКонтакте',
    dataExtraction: ['email', 'first_name', 'last_name', 'photo']
  },
  yandex: {
    id: 'yandex',
    name: 'Яндекс',
    icon: '🔴',
    color: '#FF0000',
    enabled: true,
    priority: 6,
    description: 'Войти через Яндекс',
    dataExtraction: ['email', 'first_name', 'last_name', 'default_avatar_id']
  }
}

// ========================================
// ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
// ========================================

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
  avatar?: string
  verified: boolean
  subscriptionTier: 'FREE' | 'PREMIUM'
  createdAt: Date
  updatedAt: Date
}

export interface SocialProfile {
  provider: AuthProvider
  providerId: string
  email?: string
  name?: string
  picture?: string
  phone?: string
  rawData?: Record<string, any>
}

// ========================================
// СЕССИИ И ТОКЕНЫ
// ========================================

export interface AuthSession {
  id: string
  specialistId: string
  sessionToken: string
  deviceFingerprint?: string
  userAgent?: string
  ipAddress?: string
  isActive: boolean
  expiresAt: Date
  lastUsedAt: Date
  createdAt: Date
}

export interface SessionData {
  specialistId: string
  sessionToken: string
  expiresAt: Date
  userAgent?: string
  deviceFingerprint?: string
}

// ========================================
// SMS ВЕРИФИКАЦИЯ
// ========================================

export interface SMSVerification {
  id: string
  phone: string
  code: string
  purpose: AuthPurpose
  isUsed: boolean
  attempts: number
  expiresAt: Date
  createdAt: Date
  usedAt?: Date
}

export interface SMSRequest {
  phone: string
  purpose: AuthPurpose
  testMode?: boolean
}

export interface SMSVerificationRequest {
  phone: string
  code: string
  purpose: AuthPurpose
}

// ========================================
// СОЦИАЛЬНЫЕ АККАУНТЫ
// ========================================

export interface SocialAccount {
  id: string
  specialistId: string
  provider: AuthProvider
  providerId: string
  email?: string
  name?: string
  picture?: string
  isPrimary: boolean
  isVerified: boolean
  rawData?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface SocialAuthRequest {
  provider: AuthProvider
  code?: string
  state?: string
  redirectUri?: string
}

export interface SocialAuthResponse {
  success: boolean
  specialistId?: string
  isNewUser?: boolean
  sessionToken?: string
  socialAccount?: SocialAccount
  error?: string
}

// ========================================
// РЕГИСТРАЦИЯ И ВХОД
// ========================================

export interface RegistrationRequest {
  provider: AuthProvider
  phone?: string
  code?: string
  socialData?: SocialProfile
  profile?: Partial<UserProfile>
}

export interface LoginRequest {
  provider: AuthProvider
  phone?: string
  code?: string
  socialData?: SocialProfile
  rememberMe?: boolean
}

export interface AuthResponse {
  success: boolean
  sessionToken?: string
  specialist?: UserProfile
  isNewUser?: boolean
  requiresProfileCompletion?: boolean
  error?: string
  errorCode?: string
}

// ========================================
// УПРАВЛЕНИЕ АККАУНТАМИ
// ========================================

export interface AccountLinkingRequest {
  specialistId: string
  provider: AuthProvider
  socialData: SocialProfile
  conflictResolution?: 'merge' | 'separate' | 'user_choice'
}

export interface AccountLinkingResponse {
  success: boolean
  linkedAccount?: SocialAccount
  conflicts?: Array<{
    field: string
    currentValue: string
    newValue: string
    resolution: string
  }>
  error?: string
}

// ========================================
// КОНФИГУРАЦИЯ И НАСТРОЙКИ
// ========================================

export interface AuthConfig {
  smsProvider: 'mock' | 'smsru' | 'twilio'
  testMode: boolean
  testPhones: string[]
  rateLimiting: {
    smsPerPhone: string
    registrationPerIP: string
    loginAttempts: string
  }
  session: {
    duration: number // в миллисекундах
    maxDevices: number
    autoExtend: boolean
  }
  security: {
    deviceFingerprinting: boolean
    fraudDetection: boolean
    captcha: boolean
  }
}

// ========================================
// ОШИБКИ И ВАЛИДАЦИЯ
// ========================================

export interface AuthError {
  code: string
  message: string
  field?: string
  details?: Record<string, any>
}

export const AUTH_ERRORS = {
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_CODE: 'INVALID_CODE',
  CODE_EXPIRED: 'CODE_EXPIRED',
  CODE_USED: 'CODE_USED',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  PHONE_ALREADY_EXISTS: 'PHONE_ALREADY_EXISTS',
  SOCIAL_ACCOUNT_EXISTS: 'SOCIAL_ACCOUNT_EXISTS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_INVALID: 'SESSION_INVALID',
  PROVIDER_NOT_AVAILABLE: 'PROVIDER_NOT_AVAILABLE',
  INVALID_SOCIAL_DATA: 'INVALID_SOCIAL_DATA',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FRAUD_DETECTED: 'FRAUD_DETECTED',
  CAPTCHA_REQUIRED: 'CAPTCHA_REQUIRED'
} as const

export type AuthErrorCode = typeof AUTH_ERRORS[keyof typeof AUTH_ERRORS]
