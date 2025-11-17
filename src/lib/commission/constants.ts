/**
 * Константы для системы комиссий
 */

export const COMMISSION_CONFIG = {
  RATE: 0.05, // 5% комиссия платформы
  CASHBACK_RATE: 0.025, // 2.5% кешбэк (50% от комиссии)
  PLATFORM_USER_ID: 'platform-system-user',
  ROUNDING_MODE: 'round' as const, // 'round' | 'floor' | 'ceil'
  MIN_COMMISSION: 0.01, // Минимальная комиссия
} as const

