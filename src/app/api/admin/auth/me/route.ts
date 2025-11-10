/**
 * API endpoint для получения текущего администратора
 * GET /api/admin/auth/me
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.adminId,
        username: admin.username,
      },
    })
  } catch (error) {
    console.error('Ошибка получения информации об администраторе:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

