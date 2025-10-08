/**
 * API для управления конкретным FAQ
 * DELETE /api/specialist/faqs/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    const faqId = params.id

    // Проверяем, что FAQ принадлежит текущему специалисту
    const faq = await prisma.fAQ.findUnique({
      where: { id: faqId },
      select: { specialistId: true }
    })

    if (!faq) {
      return NextResponse.json(
        { success: false, error: 'FAQ не найден' },
        { status: 404 }
      )
    }

    if (faq.specialistId !== session.specialistId) {
      return NextResponse.json(
        { success: false, error: 'Нет доступа' },
        { status: 403 }
      )
    }

    // Удаляем FAQ
    await prisma.fAQ.delete({
      where: { id: faqId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API/specialist/faqs/delete] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

