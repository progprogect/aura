/**
 * API для управления FAQ специалиста
 * POST /api/specialist/faqs - создание FAQ
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

const CreateFAQSchema = z.object({
  question: z.string().min(5, 'Вопрос слишком короткий').max(200, 'Вопрос слишком длинный'),
  answer: z.string().min(10, 'Ответ слишком короткий').max(1000, 'Ответ слишком длинный'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    if (!session.specialistProfile) {
      return NextResponse.json(
        { success: false, error: 'Профиль специалиста не найден' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = CreateFAQSchema.parse(body)

    // Получаем максимальный order для нового FAQ
    const maxOrder = await prisma.fAQ.findFirst({
      where: { specialistProfileId: session.specialistProfile!.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newFAQ = await prisma.fAQ.create({
      data: {
        specialistProfileId: session.specialistProfile!.id,
        question: data.question,
        answer: data.answer,
        order: (maxOrder?.order || 0) + 1,
      }
    })

    return NextResponse.json({ success: true, faq: newFAQ })

  } catch (error) {
    console.error('[API/specialist/faqs] Ошибка:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

