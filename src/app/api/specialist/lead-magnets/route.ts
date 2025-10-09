/**
 * API для управления лид-магнитами
 * GET - получение всех лид-магнитов
 * POST - создание нового лид-магнита
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { uploadImage } from '@/lib/cloudinary/config'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

const CreateLeadMagnetSchema = z.object({
  type: z.enum(['file', 'link', 'service']),
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(200),
  fileUrl: z.string().optional(),
  linkUrl: z.string().url().optional(),
  emoji: z.string().default('🎁'),
})

export async function GET(request: NextRequest) {
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

    const leadMagnets = await prisma.leadMagnet.findMany({
      where: {
        specialistProfileId: session.specialistProfile!.id,
        isActive: true
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ success: true, leadMagnets })

  } catch (error) {
    console.error('[API/lead-magnets/GET] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

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

    // Проверяем лимит (макс 6)
    const count = await prisma.leadMagnet.count({
      where: {
        specialistProfileId: session.specialistProfile!.id,
        isActive: true
      }
    })

    if (count >= 6) {
      return NextResponse.json(
        { success: false, error: 'Максимум 6 лид-магнитов' },
        { status: 400 }
      )
    }

    const contentType = request.headers.get('content-type')
    let data: any

    // Обработка FormData (для файлов) или JSON
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const type = formData.get('type') as string
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const emoji = formData.get('emoji') as string || '🎁'

      // Загружаем файл
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
      const uploadResult = await uploadImage(base64, 'lead-magnets')

      data = {
        type,
        title,
        description,
        fileUrl: uploadResult.url,
        emoji
      }
    } else {
      const body = await request.json()
      data = CreateLeadMagnetSchema.parse(body)
    }

    // Валидация в зависимости от типа
    if (data.type === 'file' && !data.fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Файл обязателен для типа "file"' },
        { status: 400 }
      )
    }

    if (data.type === 'link' && (!data.linkUrl || data.linkUrl.trim() === '')) {
      return NextResponse.json(
        { success: false, error: 'Ссылка обязательна для типа "link"' },
        { status: 400 }
      )
    }

    // Получаем максимальный order
    const maxOrder = await prisma.leadMagnet.findFirst({
      where: { specialistProfileId: session.specialistProfile!.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const leadMagnet = await prisma.leadMagnet.create({
      data: {
        specialistProfileId: session.specialistProfile!.id,
        type: data.type,
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        linkUrl: data.linkUrl,
        emoji: data.emoji,
        order: (maxOrder?.order || 0) + 1,
      }
    })

    return NextResponse.json({ success: true, leadMagnet })

  } catch (error) {
    console.error('[API/lead-magnets/POST] Ошибка:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ошибка валидации', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

