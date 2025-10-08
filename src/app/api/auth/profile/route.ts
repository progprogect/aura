/**
 * API endpoint для получения профиля специалиста
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProfileBySession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Токен сессии не предоставлен' },
        { status: 401 }
      )
    }

    const result = await getProfileBySession(sessionToken)

    return NextResponse.json(result, { 
      status: result.success ? 200 : 401 
    })

  } catch (error) {
    console.error('[API/auth/profile] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
