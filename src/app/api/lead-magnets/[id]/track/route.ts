/**
 * API для трекинга действий с лид-магнитами
 * POST - отслеживание просмотров и скачиваний
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const TrackActionSchema = z.object({
  action: z.enum(['view', 'download']),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action } = TrackActionSchema.parse(body)

    // Проверяем существование лид-магнита
    const leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id: params.id },
      select: { id: true }
    })

    if (!leadMagnet) {
      return NextResponse.json(
        { success: false, error: 'Лид-магнит не найден' },
        { status: 404 }
      )
    }

    // Обновляем счетчик в зависимости от действия
    if (action === 'view') {
      await prisma.leadMagnet.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } }
      })
    } else if (action === 'download') {
      await prisma.leadMagnet.update({
        where: { id: params.id },
        data: { downloadCount: { increment: 1 } }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API/lead-magnets/track] Ошибка:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Неверный формат данных', details: error.issues },
        { status: 400 }
      )
    }

    // Трекинг не должен ломать UX - возвращаем 200 даже при ошибке
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

