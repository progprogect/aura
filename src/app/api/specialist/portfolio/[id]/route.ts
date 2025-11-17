/**
 * API для редактирования/удаления конкретного элемента портфолио
 * PATCH /api/specialist/portfolio/[id] - обновление
 * DELETE /api/specialist/portfolio/[id] - удаление
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { uploadImage, uploadVideo } from '@/lib/cloudinary/config'

const UpdatePortfolioSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
})

// Обновление элемента портфолио
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

    // Проверяем что элемент портфолио принадлежит специалисту
    const existing = await prisma.portfolioItem.findUnique({
      where: { id: params.id }
    })

    if (!existing || existing.specialistProfileId !== session.specialistProfile!.id) {
      return NextResponse.json(
        { success: false, error: 'Элемент портфолио не найден' },
        { status: 404 }
      )
    }

    // Проверяем, это FormData (с файлом) или JSON (только текст)
    const contentType = request.headers.get('content-type') || ''
    let updateData: any = {}

    if (contentType?.includes('multipart/form-data')) {
      // Обработка FormData с возможным файлом
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const title = formData.get('title') as string | null
      const description = formData.get('description') as string | null

      // Если передан новый файл, загружаем его
      if (file && file.size > 0) {
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')
        
        if (!isImage && !isVideo) {
          return NextResponse.json(
            { success: false, error: 'Можно загружать только фото или видео' },
            { status: 400 }
          )
        }

        const type = isImage ? 'photo' : 'video'
        const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024
        if (file.size > maxSize) {
          return NextResponse.json(
            { success: false, error: `Файл слишком большой. Максимум ${type === 'video' ? 100 : 10}MB` },
            { status: 400 }
          )
        }

        // Проверяем, настроен ли Cloudinary
        const isCloudinaryConfigured = 
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET

        if (!isCloudinaryConfigured) {
          return NextResponse.json(
            { success: false, error: 'Cloudinary не настроен. Загрузка файлов недоступна.' },
            { status: 503 }
          )
        }

        // Конвертируем File в base64 и загружаем
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

        if (type === 'video') {
          const uploadResult = await uploadVideo(base64, 'portfolio')
          updateData.url = uploadResult.url
          updateData.thumbnailUrl = uploadResult.thumbnailUrl || null
          updateData.type = 'video'
        } else {
          const uploadResult = await uploadImage(base64, 'portfolio')
          updateData.url = uploadResult.url
          updateData.type = 'photo'
          updateData.thumbnailUrl = null
        }
      }

      // Обновляем текстовые поля
      if (title !== null) {
        if (title.trim().length < 2) {
          return NextResponse.json(
            { success: false, error: 'Заголовок должен содержать минимум 2 символа' },
            { status: 400 }
          )
        }
        updateData.title = title.trim()
      }

      if (description !== null) {
        updateData.description = description.trim() || null
      }
    } else {
      // Обработка JSON (только текстовые поля)
      const body = await request.json()
      const data = UpdatePortfolioSchema.parse(body)

      if (data.title !== undefined) {
        if (data.title.trim().length < 2) {
          return NextResponse.json(
            { success: false, error: 'Заголовок должен содержать минимум 2 символа' },
            { status: 400 }
          )
        }
        updateData.title = data.title.trim()
      }

      if (data.description !== undefined) {
        updateData.description = data.description?.trim() || null
      }
    }

    // Обновляем элемент портфолио
    const portfolioItem = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      item: portfolioItem
    })

  } catch (error) {
    console.error('Ошибка при обновлении портфолио:', error)

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

// Удаление элемента портфолио
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

    // Проверяем что элемент портфолио принадлежит специалисту
    const existing = await prisma.portfolioItem.findUnique({
      where: { id: params.id }
    })

    if (!existing || existing.specialistProfileId !== session.specialistProfile!.id) {
      return NextResponse.json(
        { success: false, error: 'Элемент портфолио не найден' },
        { status: 404 }
      )
    }

    await prisma.portfolioItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Элемент портфолио удален'
    })

  } catch (error) {
    console.error('Ошибка при удалении портфолио:', error)

    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

