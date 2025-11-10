/**
 * Аутентификация администратора
 */

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const SESSION_TOKEN_LENGTH = 32
const SESSION_DURATION_HOURS = 24

/**
 * Генерация токена сессии
 */
function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_LENGTH).toString('hex')
}

/**
 * Хеширование пароля
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * Проверка пароля
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Создание админ-сессии
 */
export async function createAdminSession(
  adminId: string,
  userAgent?: string | null,
  ipAddress?: string | null
): Promise<string> {
  const sessionToken = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS)

  await prisma.adminSession.create({
    data: {
      adminId,
      sessionToken,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt,
    },
  })

  return sessionToken
}

/**
 * Проверка валидности админ-сессии
 */
export async function validateAdminSession(
  sessionToken: string
): Promise<{ adminId: string; username: string } | null> {
  const session = await prisma.adminSession.findFirst({
    where: {
      sessionToken,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: {
      admin: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  // Обновляем время последнего использования
  await prisma.adminSession.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() },
  })

  return {
    adminId: session.admin.id,
    username: session.admin.username,
  }
}

/**
 * Удаление админ-сессии
 */
export async function deleteAdminSession(sessionToken: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: { sessionToken },
    data: { isActive: false },
  })
}

/**
 * Получение текущего админа из request (серверный компонент)
 */
export async function getAdminFromRequest(
  request: NextRequest
): Promise<{ adminId: string; username: string } | null> {
  const sessionToken = request.cookies.get('admin_session_token')?.value

  if (!sessionToken) {
    return null
  }

  return validateAdminSession(sessionToken)
}

/**
 * Получение текущего админа из cookies (серверный компонент)
 */
export async function getAdminFromCookies(): Promise<{
  adminId: string
  username: string
} | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('admin_session_token')?.value

  if (!sessionToken) {
    return null
  }

  return validateAdminSession(sessionToken)
}

/**
 * Вход администратора
 */
export async function adminLogin(
  username: string,
  password: string,
  userAgent?: string | null,
  ipAddress?: string | null
): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
  try {
    // Ищем админа по username
    const admin = await prisma.admin.findUnique({
      where: { username },
    })

    if (!admin) {
      return { success: false, error: 'Неверный логин или пароль' }
    }

    // Проверяем пароль
    const isPasswordValid = await verifyPassword(password, admin.passwordHash)

    if (!isPasswordValid) {
      return { success: false, error: 'Неверный логин или пароль' }
    }

    // Создаем сессию
    const sessionToken = await createAdminSession(
      admin.id,
      userAgent,
      ipAddress
    )

    return { success: true, sessionToken }
  } catch (error) {
    console.error('Ошибка входа администратора:', error)
    return { success: false, error: 'Внутренняя ошибка сервера' }
  }
}

