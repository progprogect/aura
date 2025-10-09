/**
 * API endpoint для получения текущего пользователя
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedUserFromSession } from '@/lib/auth/unified-auth-service'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const user = await getUnifiedUserFromSession(sessionToken)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Сессия недействительна' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('[API/auth/user/me] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

