/**
 * API endpoint для верификации специалиста
 * PATCH /api/admin/specialists/[id]/verify
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
    const { verified } = body

    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Параметр verified должен быть boolean' },
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

    // Обновляем статус верификации
    const updated = await prisma.specialistProfile.update({
      where: { id: params.id },
      data: {
        verified,
        verifiedAt: verified ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      specialist: {
        id: updated.id,
        verified: updated.verified,
        verifiedAt: updated.verifiedAt,
      },
    })
  } catch (error: any) {
    if (error instanceof NextResponse) {
      return error
    }
    console.error('Ошибка верификации специалиста:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

