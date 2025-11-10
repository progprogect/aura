/**
 * Утилиты для проверки прав администратора в API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from './auth'

/**
 * Стандартный ответ для неавторизованных админов
 */
export const ADMIN_UNAUTHORIZED_RESPONSE = {
  success: false,
  error: 'Требуется авторизация администратора',
}

/**
 * Проверка авторизации админа в API route
 * Выбрасывает NextResponse если не авторизован
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ adminId: string; username: string }> {
  const admin = await getAdminFromRequest(request)

  if (!admin) {
    throw NextResponse.json(ADMIN_UNAUTHORIZED_RESPONSE, { status: 401 })
  }

  return admin
}

