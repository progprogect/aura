/**
 * API endpoint для выхода из системы
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth/api-auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Получаем текущую сессию
    const session = await getAuthSession(request)
    
    if (session) {
      // Удаляем сессию из базы данных
      await prisma.authSession.delete({
        where: {
          sessionToken: session.sessionToken
        }
      })
    }

    // Очищаем cookie на клиенте
    const response = NextResponse.json({ success: true })
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Немедленно истекает
      path: '/',
    })

    return response

  } catch (error) {
    console.error('[API/auth/logout] Ошибка:', error)
    
    // Даже если произошла ошибка, очищаем cookie
    const response = NextResponse.json({ success: false, error: 'Ошибка при выходе' })
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    
    return response
  }
}
