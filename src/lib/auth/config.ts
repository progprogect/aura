/**
 * Конфигурация системы авторизации
 */

export const AUTH_CONFIG = {
  sms: {
    provider: process.env.SMS_PROVIDER || 'mock', // 'smsru', 'twilio', 'mock'
    smsRuApiId: process.env.SMSRU_API_ID,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER,
    codeLength: 4,
    codeExpiresInMinutes: 5,
    maxAttempts: 3,
    resendDelaySeconds: 60,
  },
  session: {
    secret: process.env.JWT_SECRET || 'supersecretjwtkey',
    expiresIn: '7d',
    autoExtend: true,
    maxSessionsPerUser: 5,
    cleanupIntervalHours: 24, // Очистка неактивных сессий каждые 24 часа
  },
  testMode: {
    enabled: process.env.NODE_ENV !== 'production' && process.env.ENABLE_TEST_AUTH === 'true',
    testPhones: {
      '+79999999999': '1234',
      '+78888888888': '5678',
      '+77777777777': '9999',
    },
    defaultTestCode: '1234',
  },
  social: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    },
    vk: {
      appId: process.env.VK_APP_ID,
      appSecret: process.env.VK_APP_SECRET,
      redirectUri: process.env.VK_REDIRECT_URI,
    },
    yandex: {
      clientId: process.env.YANDEX_CLIENT_ID,
      clientSecret: process.env.YANDEX_CLIENT_SECRET,
      redirectUri: process.env.YANDEX_REDIRECT_URI,
    },
    whatsapp: {
      businessId: process.env.WHATSAPP_BUSINESS_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      botUsername: process.env.TELEGRAM_BOT_USERNAME,
    },
  },
  rateLimiting: {
    smsPerPhone: {
      windowMs: 60 * 60 * 1000, // 1 час
      max: 3, // максимум 3 SMS в час
    },
    registrationPerIP: {
      windowMs: 60 * 60 * 1000, // 1 час
      max: 5, // максимум 5 регистраций в час с одного IP
    },
    loginAttempts: {
      windowMs: 60 * 60 * 1000, // 1 час
      max: 10, // максимум 10 попыток входа в час
    },
  },
  security: {
    deviceFingerprinting: true,
    ipWhitelist: process.env.IP_WHITELIST?.split(','),
    enableCaptcha: process.env.ENABLE_CAPTCHA === 'true',
    sessionTimeoutMinutes: 30, // Таймаут неактивности
  },
  analytics: {
    enabled: process.env.ENABLE_AUTH_ANALYTICS === 'true',
    trackConversionFunnel: true,
    trackDropOffPoints: true,
  },
  cache: {
    enabled: process.env.REDIS_URL ? true : false,
    sessionTTL: 60 * 60, // 1 час
    smsTTL: 5 * 60, // 5 минут
  },
} as const

export type AuthConfig = typeof AUTH_CONFIG
