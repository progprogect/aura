/**
 * API endpoint для входа обычного пользователя
 */

import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth/user-auth-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = body

    // Валидация
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'Номер телефона и код обязательны' },
        { status: 400 }
      )
    }

    const result = await loginUser({ phone, code })

    if (result.success && result.sessionToken) {
      // Устанавливаем токен сессии в cookies
      const response = NextResponse.json(result, { status: 200 })
      response.cookies.set('session_token', result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 дней
        path: '/',
      })
      
      return response
    }

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })

  } catch (error) {
    console.error('[API/auth/user/login] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

