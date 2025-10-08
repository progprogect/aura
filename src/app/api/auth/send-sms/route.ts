/**
 * API endpoint для отправки SMS кода
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationSMS } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, purpose } = body

    if (!phone || !purpose) {
      return NextResponse.json(
        { success: false, error: 'Необходимо указать номер телефона и цель' },
        { status: 400 }
      )
    }

    const result = await sendVerificationSMS(phone, purpose)

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    })

  } catch (error) {
    console.error('[API/auth/send-sms] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
