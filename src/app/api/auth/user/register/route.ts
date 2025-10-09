/**
 * API endpoint для регистрации обычного пользователя (Unified)
 */

import { NextRequest, NextResponse } from 'next/server'
import { unifiedRegister } from '@/lib/auth/unified-auth-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code, firstName, lastName } = body

    // Валидация
    if (!phone || !code || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Все поля обязательны' },
        { status: 400 }
      )
    }

    const result = await unifiedRegister({ phone, code, role: 'user', firstName, lastName })

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
    console.error('[API/auth/user/register] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

