/**
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
 * API для редактирования/удаления конкретного образования
 * PATCH /api/specialist/education/[id] - обновление
 * DELETE /api/specialist/education/[id] - удаление
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

const UpdateEducationSchema = z.object({
  institution: z.string().min(2).optional(),
  degree: z.string().min(2).optional(),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 10).optional(),
  description: z.string().optional().nullable(),
})

// Обновление образования
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Проверяем что образование принадлежит специалисту
    const existing = await prisma.education.findUnique({
      where: { id: params.id }
    })

    if (!existing || existing.specialistProfileId !== session.specialistProfile!.id) {
      return NextResponse.json(
        { success: false, error: 'Образование не найдено' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = UpdateEducationSchema.parse(body)

    const education = await prisma.education.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json({
      success: true,
      education
    })

  } catch (error) {
    console.error('Ошибка при обновлении образования:', error)

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

// Удаление образования
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Проверяем что образование принадлежит специалисту
    const existing = await prisma.education.findUnique({
      where: { id: params.id }
    })

    if (!existing || existing.specialistProfileId !== session.specialistProfile!.id) {
      return NextResponse.json(
        { success: false, error: 'Образование не найдено' },
        { status: 404 }
      )
    }

    await prisma.education.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Образование удалено'
    })

  } catch (error) {
    console.error('Ошибка при удалении образования:', error)

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

