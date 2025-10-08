/**
 * API для загрузки аватара специалиста
 * POST /api/specialist/avatar
 * Поддерживает:
 * 1. Base64 изображение (прямая загрузка)
 * 2. URL изображения (fallback если Cloudinary не настроен)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { uploadAvatar, isCloudinaryConfigured } from '@/lib/cloudinary/config'
import { z } from 'zod'

const AvatarSchema = z.object({
  // Либо base64 изображение
  image: z.string().optional(),
  // Либо URL изображения
  imageUrl: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
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
    const data = AvatarSchema.parse(body)

    let avatarUrl: string

    // Вариант 1: Загрузка base64 в Cloudinary
    if (data.image) {
      if (!isCloudinaryConfigured()) {
        return NextResponse.json(
          { success: false, error: 'Cloudinary не настроен. Используйте URL изображения.' },
          { status: 400 }
        )
      }

      // Валидация base64
      if (!data.image.startsWith('data:image/')) {
        return NextResponse.json(
          { success: false, error: 'Некорректный формат изображения' },
          { status: 400 }
        )
      }

      // Проверка размера (макс 5MB)
      const base64Length = data.image.length * 0.75 / 1024 / 1024
      if (base64Length > 5) {
        return NextResponse.json(
          { success: false, error: 'Изображение слишком большое (макс 5MB)' },
          { status: 400 }
        )
      }

      avatarUrl = await uploadAvatar(data.image, session.specialistId)
    }
    // Вариант 2: Сохранение URL
    else if (data.imageUrl) {
      avatarUrl = data.imageUrl
    }
    // Ошибка: ни image, ни imageUrl
    else {
      return NextResponse.json(
        { success: false, error: 'Предоставьте изображение или URL' },
        { status: 400 }
      )
    }

    // Сохраняем URL в БД
    const specialist = await prisma.specialist.update({
      where: { id: session.specialistId },
      data: {
        avatar: avatarUrl,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      avatarUrl: specialist.avatar,
      message: 'Аватар обновлён'
    })

  } catch (error) {
    console.error('Ошибка при загрузке аватара:', error)

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

