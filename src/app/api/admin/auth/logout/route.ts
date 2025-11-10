/**
 * API endpoint для выхода администратора
 * POST /api/admin/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest, deleteAdminSession } from '@/lib/admin/auth'

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (admin) {
      const sessionToken = request.cookies.get('admin_session_token')?.value
      if (sessionToken) {
        await deleteAdminSession(sessionToken)
      }
    }

    // Создаем ответ с удалением cookie
    const response = NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно',
    })

    // Удаляем cookie
    response.cookies.delete('admin_session_token')

    return response
  } catch (error) {
    console.error('Ошибка выхода администратора:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

