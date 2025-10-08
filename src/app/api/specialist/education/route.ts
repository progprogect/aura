/**
 * API для управления образованием специалиста
 * POST - добавление
 * PATCH - обновление
 * DELETE - удаление
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const EducationSchema = z.object({
  institution: z.string().min(2, 'Название учебного заведения обязательно'),
  degree: z.string().min(2, 'Специальность обязательна'),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 10),
  description: z.string().optional().nullable(),
})

// Добавление образования
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const session = await prisma.authSession.findFirst({
      where: {
        sessionToken,
        expiresAt: { gt: new Date() }
      }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Сессия истекла' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = EducationSchema.parse(body)

    // Получаем максимальный order
    const maxOrder = await prisma.education.findFirst({
      where: { specialistId: session.specialistId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const education = await prisma.education.create({
      data: {
        specialistId: session.specialistId,
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
        { success: false, error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

