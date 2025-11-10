/**
 * API для управления галереей специалиста
 * POST /api/specialist/gallery - загрузка фото/видео
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { uploadImage, uploadVideo } from '@/lib/cloudinary/config'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'

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
    const type = formData.get('type') as string

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

    if (type !== 'photo' && type !== 'video') {
      return NextResponse.json(
        { success: false, error: 'Неверный тип файла' },
        { status: 400 }
      )
    }

    // Проверка размера (макс 10MB для фото, 100MB для видео)
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    const maxSizeMB = type === 'video' ? 100 : 10
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `Файл слишком большой. Максимум ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Проверяем, не слишком ли много элементов в галерее
    const currentCount = await prisma.galleryItem.count({
      where: { specialistProfileId: session.specialistProfile!.id }
    })

    if (currentCount >= 20) {
      return NextResponse.json(
        { success: false, error: 'Максимум 20 элементов в галерее' },
        { status: 400 }
      )
    }

    let url: string

    // Проверяем, настроен ли Cloudinary
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET

    if (isCloudinaryConfigured) {
      // Конвертируем File в base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

      // Загружаем через Cloudinary в зависимости от типа
      if (type === 'video') {
        const uploadResult = await uploadVideo(base64, 'gallery')
        url = uploadResult.url
        // Для видео также сохраняем thumbnailUrl
        const maxOrder = await prisma.galleryItem.findFirst({
          where: { specialistProfileId: session.specialistProfile!.id },
          orderBy: { order: 'desc' },
          select: { order: true }
        })

        const galleryItem = await prisma.galleryItem.create({
          data: {
            specialistProfileId: session.specialistProfile!.id,
            type: type,
            url: url,
            thumbnailUrl: uploadResult.thumbnailUrl || null,
            caption: null,
            order: (maxOrder?.order || 0) + 1,
          }
        })

        return NextResponse.json({ success: true, item: galleryItem })
      } else {
        const uploadResult = await uploadImage(base64, 'gallery')
        url = uploadResult.url
      }
    } else {
      // Fallback: возвращаем ошибку
      return NextResponse.json(
        { success: false, error: 'Cloudinary не настроен. Загрузка файлов недоступна.' },
        { status: 503 }
      )
    }

    // Получаем максимальный order (только для фото, для видео уже создано выше)
    const maxOrder = await prisma.galleryItem.findFirst({
      where: { specialistProfileId: session.specialistProfile!.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    // Создаём элемент галереи (только для фото)
    const galleryItem = await prisma.galleryItem.create({
      data: {
        specialistProfileId: session.specialistProfile!.id,
        type: type,
        url: url,
        thumbnailUrl: null,
        caption: null,
        order: (maxOrder?.order || 0) + 1,
      }
    })

    return NextResponse.json({ success: true, item: galleryItem })

  } catch (error) {
    console.error('[API/specialist/gallery] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

