/**
 * API endpoint для входа администратора
 * POST /api/admin/auth/login
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminLogin } from '@/lib/admin/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Логин и пароль обязательны' },
        { status: 400 }
      )
    }

    // Получаем user agent и IP
    const userAgent = request.headers.get('user-agent')
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      null

    // Выполняем вход
    const result = await adminLogin(username, password, userAgent, ipAddress)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }

    // Создаем ответ с установкой cookie
    const response = NextResponse.json({
      success: true,
      message: 'Вход выполнен успешно',
    })

    // Устанавливаем cookie с сессией
    response.cookies.set('admin_session_token', result.sessionToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 часа
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Ошибка входа администратора:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

