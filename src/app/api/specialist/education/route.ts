/**
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
 * API для управления образованием специалиста
 * POST - добавление
 * PATCH - обновление
 * DELETE - удаление
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

const EducationSchema = z.object({
  institution: z.string().min(2, 'Название учебного заведения обязательно'),
  degree: z.string().min(2, 'Специальность обязательна'),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 10),
  description: z.string().optional().nullable(),
})

// Добавление образования
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
    const data = EducationSchema.parse(body)

    // Получаем максимальный order
    const maxOrder = await prisma.education.findFirst({
      where: { specialistProfileId: session.specialistProfile!.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const education = await prisma.education.create({
      data: {
        specialistProfileId: session.specialistProfile!.id,
        institution: data.institution,
        degree: data.degree,
        year: data.year,
        description: data.description || null,
        order: (maxOrder?.order || 0) + 1
      }
    })

    return NextResponse.json({
      success: true,
      education
    })

  } catch (error) {
    console.error('Ошибка при добавлении образования:', error)

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

