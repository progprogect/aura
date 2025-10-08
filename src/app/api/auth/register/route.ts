/**
 * API endpoint для регистрации специалиста
 */

import { NextRequest, NextResponse } from 'next/server'
import { registerSpecialist } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await registerSpecialist(body)

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })

  } catch (error) {
    console.error('[API/auth/register] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
