/**
 * API для управления портфолио специалиста
 * POST /api/specialist/portfolio - загрузка фото/видео с заголовком и описанием
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { uploadImage, uploadVideo } from '@/lib/cloudinary/config'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { z } from 'zod'

const PortfolioSchema = z.object({
  title: z.string().min(2, 'Заголовок должен содержать минимум 2 символа'),
  description: z.string().optional().nullable(),
})

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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Файл не предоставлен' },
        { status: 400 }
      )
    }

    // Проверка на пустой файл
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Файл пустой' },
        { status: 400 }
      )
    }

    // Валидация текстовых полей
    const textData = PortfolioSchema.parse({ title, description })

    // Определение типа файла
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, error: 'Можно загружать только фото или видео' },
        { status: 400 }
      )
    }

    const type = isImage ? 'photo' : 'video'

    // Проверка размера (макс 10MB для фото, 100MB для видео)
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    const maxSizeMB = type === 'video' ? 100 : 10
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `Файл слишком большой. Максимум ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Проверяем, не слишком ли много элементов в портфолио
    const currentCount = await prisma.portfolioItem.count({
      where: { specialistProfileId: session.specialistProfile!.id }
    })

    if (currentCount >= 20) {
      return NextResponse.json(
        { success: false, error: 'Максимум 20 элементов в портфолио' },
        { status: 400 }
      )
    }

    let url: string
    let thumbnailUrl: string | null = null

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

    // Конвертируем File в base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Загружаем через Cloudinary в зависимости от типа
    if (type === 'video') {
      const uploadResult = await uploadVideo(base64, 'portfolio')
      url = uploadResult.url
      thumbnailUrl = uploadResult.thumbnailUrl || null
    } else {
      const uploadResult = await uploadImage(base64, 'portfolio')
      url = uploadResult.url
    }

    // Получаем максимальный order
    const maxOrder = await prisma.portfolioItem.findFirst({
      where: { specialistProfileId: session.specialistProfile!.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    // Создаём элемент портфолио
    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        specialistProfileId: session.specialistProfile!.id,
        type: type,
        url: url,
        thumbnailUrl: thumbnailUrl,
        title: textData.title.trim(),
        description: textData.description?.trim() || null,
        order: (maxOrder?.order || 0) + 1,
      }
    })

    return NextResponse.json({ success: true, item: portfolioItem })

  } catch (error) {
    console.error('[API/specialist/portfolio] Ошибка:', error)

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

