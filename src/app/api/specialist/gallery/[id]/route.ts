/**
 * API для управления конкретным элементом галереи
 * DELETE /api/specialist/gallery/[id]
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

    const itemId = params.id

    // Проверяем, что элемент принадлежит текущему специалисту
    const item = await prisma.galleryItem.findUnique({
      where: { id: itemId },
      select: { specialistId: true }
    })

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Элемент не найден' },
        { status: 404 }
      )
    }

    if (item.specialistId !== session.specialistId) {
      return NextResponse.json(
        { success: false, error: 'Нет доступа' },
        { status: 403 }
      )
    }

    // Удаляем элемент
    await prisma.galleryItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API/specialist/gallery/delete] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

