/**
 * API для редактирования/удаления конкретного сертификата
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const UpdateCertificateSchema = z.object({
  title: z.string().min(2).optional(),
  organization: z.string().min(2).optional(),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 10).optional(),
  fileUrl: z.string().url().optional().nullable(),
})

// Обновление сертификата
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existing = await prisma.certificate.findUnique({
      where: { id: params.id }
    })

    if (!existing || existing.specialistId !== session.specialistId) {
      return NextResponse.json(
        { success: false, error: 'Сертификат не найден' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = UpdateCertificateSchema.parse(body)

    const certificate = await prisma.certificate.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json({
      success: true,
      certificate
    })

  } catch (error) {
    console.error('Ошибка при обновлении сертификата:', error)

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

// Удаление сертификата
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existing = await prisma.certificate.findUnique({
      where: { id: params.id }
    })

    if (!existing || existing.specialistId !== session.specialistId) {
      return NextResponse.json(
        { success: false, error: 'Сертификат не найден' },
        { status: 404 }
      )
    }

    await prisma.certificate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Сертификат удалён'
    })

  } catch (error) {
    console.error('Ошибка при удалении сертификата:', error)

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

