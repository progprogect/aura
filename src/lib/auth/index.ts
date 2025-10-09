/**
 * Главный фасад для системы авторизации
 * Экспортирует все необходимые функции и типы
 */

// Основные сервисы
export { 
  sendVerificationSMS,
  getProfileBySession
} from './auth-service'

// Unified auth для всех типов пользователей
export {
  unifiedLogin as loginUser,
  unifiedRegister as registerUser,
  unifiedRegister as registerSpecialist,
  unifiedLogin as loginSpecialist,
  getUnifiedUserFromSession as getUserFromSession,
  unifiedLogout as logoutUser
} from './unified-auth-service'

export { 
  sendSMS,
  verifySMSCode
} from './sms-service'

// Валидация
export {
  validatePhone,
  validateSMSCode,
  validateSendSMSRequest,
  validateRegistrationRequest,
  validateLoginRequest,
  type SendSMSRequest,
  type VerifySMSCodeRequest,
  type ValidatedRegistrationRequest,
  type ValidatedLoginRequest
} from './validation'

// Бизнес-логика
export {
  SMSVerificationService
} from './business-logic'

// Утилиты
export {
  normalizePhone,
  generateSMSCode,
  extractSocialData,
  debugLog
} from './utils'

// Конфигурация
export { AUTH_CONFIG } from './config'

// Типы
export type {
  AuthProvider,
  AuthResponse,
  UserProfile,
  SocialProfile,
  RegistrationRequest,
  LoginRequest,
  SMSRequest,
  SMSVerificationRequest,
  AuthSession,
  SocialAccount,
  SMSVerification
} from './types'

// Константы
export { AUTH_PROVIDERS, AUTH_ERRORS } from './types'
