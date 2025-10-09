/**
 * API для управления конкретным лид-магнитом
 * PUT - редактирование лид-магнита
 * DELETE - удаление лид-магнита
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { uploadImage } from '@/lib/cloudinary/config'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

const UpdateLeadMagnetSchema = z.object({
  type: z.enum(['file', 'link', 'service']),
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(200),
  fileUrl: z.string().optional(),
  linkUrl: z.string().url().optional(),
  emoji: z.string().default('🎁'),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    const leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id: params.id },
      select: { specialistProfileId: true }
    })

    if (!leadMagnet) {
      return NextResponse.json(
        { success: false, error: 'Лид-магнит не найден' },
        { status: 404 }
      )
    }

    if (leadMagnet.specialistProfileId !== session.specialistProfile!.id) {
      return NextResponse.json(
        { success: false, error: 'Нет доступа' },
        { status: 403 }
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

      // Загружаем файл только если он есть
      let fileUrl = undefined
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
        const uploadResult = await uploadImage(base64, 'lead-magnets')
        fileUrl = uploadResult.url
      }

      data = {
        type,
        title,
        description,
        fileUrl,
        emoji
      }
    } else {
      const body = await request.json()
      data = UpdateLeadMagnetSchema.parse(body)
    }

    // Валидация в зависимости от типа
    if (data.type === 'file' && !data.fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Файл обязателен для типа "file"' },
        { status: 400 }
      )
    }

    if (data.type === 'link' && !data.linkUrl) {
      return NextResponse.json(
        { success: false, error: 'Ссылка обязательна для типа "link"' },
        { status: 400 }
      )
    }

    const updatedLeadMagnet = await prisma.leadMagnet.update({
      where: { id: params.id },
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        linkUrl: data.linkUrl,
        emoji: data.emoji,
      }
    })

    return NextResponse.json({ success: true, leadMagnet: updatedLeadMagnet })

  } catch (error) {
    console.error('[API/lead-magnets/PUT] Ошибка:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession(request)
    
    if (!session) {
      return NextResponse.json(UNAUTHORIZED_RESPONSE, { status: 401 })
    }

    const leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id: params.id },
      select: { specialistProfileId: true }
    })

    if (!leadMagnet) {
      return NextResponse.json(
        { success: false, error: 'Лид-магнит не найден' },
        { status: 404 }
      )
    }

    if (leadMagnet.specialistProfileId !== session.specialistProfile!.id) {
      return NextResponse.json(
        { success: false, error: 'Нет доступа' },
        { status: 403 }
      )
    }

    await prisma.leadMagnet.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API/lead-magnets/DELETE] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

