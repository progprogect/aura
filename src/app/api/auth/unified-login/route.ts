/**
 * Единый API endpoint для входа (автоматическое определение типа пользователя)
 */

import { NextRequest, NextResponse } from 'next/server'
import { unifiedLogin } from '@/lib/auth/unified-auth-service'

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

    // Пытаемся войти без указания роли - система определит автоматически
    const result = await unifiedLogin({ phone, code })

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
        console.log(`[API/unified-login] Cookie установлен: session_token=${result.sessionToken.substring(0, 10)}...`)
        console.log(`[API/unified-login] Тип пользователя: ${result.user?.hasSpecialistProfile ? 'specialist' : 'user'}`)
      }
      
      return response
    }

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })

  } catch (error) {
    console.error('[API/auth/unified-login] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
