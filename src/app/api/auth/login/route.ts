/**
 * API endpoint для входа специалиста
 */

import { NextRequest, NextResponse } from 'next/server'
import { loginSpecialist } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await loginSpecialist(body)

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
      
      // Отладочные логи
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API/login] Cookie установлен: session_token=${result.sessionToken.substring(0, 10)}...`)
      }
      
      return response
    }

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })

  } catch (error) {
    console.error('[API/auth/login] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
