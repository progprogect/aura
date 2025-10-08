/**
 * API для управления сертификатами специалиста
 * POST - добавление
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const CertificateSchema = z.object({
  title: z.string().min(2, 'Название сертификата обязательно'),
  organization: z.string().min(2, 'Организация обязательна'),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 10),
  fileUrl: z.string().url().optional().nullable(),
})

// Добавление сертификата
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
    const data = CertificateSchema.parse(body)

    // Получаем максимальный order
    const maxOrder = await prisma.certificate.findFirst({
      where: { specialistId: session.specialistId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const certificate = await prisma.certificate.create({
      data: {
        specialistId: session.specialistId,
        title: data.title,
        organization: data.organization,
        year: data.year,
        fileUrl: data.fileUrl || null,
        order: (maxOrder?.order || 0) + 1
      }
    })

    return NextResponse.json({
      success: true,
      certificate
    })

  } catch (error) {
    console.error('Ошибка при добавлении сертификата:', error)

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

