/**
 * API endpoint для блокировки профиля специалиста
 * PATCH /api/admin/specialists/[id]/block
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/permissions'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(request)

    const body = await request.json()
    const { blocked, reason } = body

    if (typeof blocked !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Параметр blocked должен быть boolean' },
        { status: 400 }
      )
    }

    const specialist = await prisma.specialistProfile.findUnique({
      where: { id: params.id },
    })

    if (!specialist) {
      return NextResponse.json(
        { success: false, error: 'Специалист не найден' },
        { status: 404 }
      )
    }

    // Обновляем статус блокировки
    const updated = await prisma.specialistProfile.update({
      where: { id: params.id },
      data: {
        blocked,
        blockedAt: blocked ? new Date() : null,
        blockedReason: blocked ? reason || null : null,
      },
    })

    return NextResponse.json({
      success: true,
      specialist: {
        id: updated.id,
        blocked: updated.blocked,
        blockedAt: updated.blockedAt,
        blockedReason: updated.blockedReason,
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Ошибка блокировки специалиста:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

