/**
 * Auth service (только общие функции)
 * Специфичные функции перенесены в specialist-auth-service.ts и user-auth-service.ts
 */

import { sendSMS } from './sms-service'
import { validateSendSMSRequest } from './validation'
import { prisma } from '@/lib/db'

// ========================================
// ОТПРАВКА SMS
// ========================================

export async function sendVerificationSMS(phone: string, purpose: 'registration' | 'login' | 'recovery') {
  const validation = validateSendSMSRequest({ phone, purpose })
  
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Ошибка валидации'
    }
  }
  
  const { data } = validation
  
  // Проверяем rate limiting
  const rateLimitCheck = await checkRateLimit(data.phone)
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      error: 'Превышен лимит отправки SMS. Попробуйте позже.'
    }
  }
  
  // Отправляем SMS
  return await sendSMS({
    phone: data.phone,
    purpose: data.purpose,
    testMode: process.env.NODE_ENV !== 'production'
  })
}

// ========================================
// RATE LIMITING
// ========================================

interface RateLimitResult {
  allowed: boolean
  remaining?: number
  resetAt?: Date
}

// Простой in-memory rate limiting (можно заменить на Redis в production)
const smsRateLimits = new Map<string, { count: number; resetAt: number }>()

async function checkRateLimit(phone: string): Promise<RateLimitResult> {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 час
  const maxRequests = 5 // Максимум 5 SMS в час
  
  const current = smsRateLimits.get(phone)
  
  // Если нет записи или окно истекло
  if (!current || current.resetAt < now) {
    smsRateLimits.set(phone, {
      count: 1,
      resetAt: now + windowMs
    })
    return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now + windowMs) }
  }
  
  // Проверяем лимит
  if (current.count >= maxRequests) {
    return { allowed: false, resetAt: new Date(current.resetAt) }
  }
  
  // Увеличиваем счётчик
  current.count++
  return { allowed: true, remaining: maxRequests - current.count, resetAt: new Date(current.resetAt) }
}

// ========================================
// ПОЛУЧЕНИЕ ПРОФИЛЯ (Legacy compatibility)
// ========================================

export async function getProfileBySession(sessionToken: string) {
  const session = await prisma.authSession.findFirst({
    where: {
      sessionToken,
      expiresAt: { gt: new Date() },
      isActive: true
    },
    include: {
      user: {
        include: {
          specialistProfile: true
        }
      }
    }
  }) as any

  if (!session || !session.user) {
    return null
  }

  // Если есть профиль специалиста, возвращаем его
  if (session.user.specialistProfile) {
    const profile = session.user.specialistProfile
    return {
      id: profile.id,
      firstName: session.user.firstName || null,
      lastName: session.user.lastName || null,
      phone: session.user.phone,
      email: session.user.email,
      avatar: session.user.avatar,
      slug: profile.slug,
      verified: profile.verified,
      subscriptionTier: profile.subscriptionTier,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    }
  }

  // Иначе возвращаем базовый профиль пользователя
  return {
    id: session.user.id,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    phone: session.user.phone,
    email: session.user.email,
    avatar: session.user.avatar,
    slug: null,
    verified: false,
    subscriptionTier: 'FREE',
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
  }
}
