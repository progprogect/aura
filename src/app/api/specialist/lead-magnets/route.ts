/**
 * API для управления лид-магнитами
 * GET - получение всех лид-магнитов
 * POST - создание нового лид-магнита
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { uploadImage, uploadDocument, uploadPDF, uploadCustomPreview, uploadFallbackPreview } from '@/lib/cloudinary/config'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { generateSlug, formatFileSize, validateHighlights } from '@/lib/lead-magnets/utils'
import { revalidateSpecialistProfile } from '@/lib/revalidation'
import { generateFallbackPreview } from '@/lib/lead-magnets/fallback-preview-generator'
import type { PreviewUrls } from '@/types/lead-magnet'

const CreateLeadMagnetSchema = z.object({
  type: z.enum(['file', 'link', 'service']),
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(200),
  fileUrl: z.string().optional(),
  linkUrl: z.string().url().optional().or(z.literal('')),  // Разрешаем пустую строку
  emoji: z.string().default('🎁'),
  // Новые опциональные поля
  highlights: z.array(z.string()).max(5).optional().default([]),
  targetAudience: z.string().max(50).optional(),
  ogImage: z.string().url().optional().or(z.literal('')),  // Разрешаем пустую строку
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
    let fileSize: string | null = null
    let previewUrls: PreviewUrls | null = null

    // Обработка FormData (для файлов или previewFile) или JSON
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const previewFile = formData.get('previewFile') as File | null
      const type = formData.get('type') as string
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const emoji = formData.get('emoji') as string || '🎁'
      const highlightsRaw = formData.get('highlights') as string || '[]'
      const targetAudience = formData.get('targetAudience') as string || undefined
      const linkUrl = formData.get('linkUrl') as string || undefined
      const fileUrl = formData.get('fileUrl') as string || undefined

      let uploadedFileUrl: string | undefined = fileUrl

      // Загружаем файл лид-магнита (если есть)
      if (file) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
        
        // Определяем тип файла и используем соответствующую функцию загрузки
        const isImage = file.type.startsWith('image/')
        const isPDF = file.type === 'application/pdf'
        const isDocument = file.type.includes('document') || 
                          file.type.includes('text/') ||
                          file.type.includes('application/vnd')
        
        let uploadResult
        if (isImage) {
          uploadResult = await uploadImage(base64, 'lead-magnets')
        } else if (isPDF) {
          uploadResult = await uploadPDF(base64, 'lead-magnets')
        } else if (isDocument) {
          uploadResult = await uploadDocument(base64, 'lead-magnets')
        } else {
          uploadResult = await uploadDocument(base64, 'lead-magnets')
        }

        uploadedFileUrl = uploadResult.url
        fileSize = formatFileSize(file.size)
      }

      // Парсим highlights
      let highlights: string[] = []
      try {
        highlights = JSON.parse(highlightsRaw)
      } catch (e) {
        // Игнорируем ошибки парсинга
      }

      data = {
        type,
        title,
        description,
        fileUrl: uploadedFileUrl,
        linkUrl,
        emoji,
        highlights,
        targetAudience,
      }

      // Обработка превью
      if (previewFile) {
        // Кастомное превью загружено
        console.log('[Lead Magnet] Загрузка кастомного превью')
        try {
          const bytes = await previewFile.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          const previewResult = await uploadCustomPreview(buffer, '')
          previewUrls = {
            thumbnail: previewResult.thumbnail,
            card: previewResult.card,
            detail: previewResult.detail
          }
          console.log('[Lead Magnet] Кастомное превью загружено')
        } catch (error) {
          console.error('[Lead Magnet] Ошибка загрузки кастомного превью:', error)
          // Продолжаем без превью - fallback будет создан ниже
        }
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

    // Валидируем highlights
    const highlightsValidation = validateHighlights(data.highlights || [])
    if (!highlightsValidation.valid) {
      return NextResponse.json(
        { success: false, error: highlightsValidation.error },
        { status: 400 }
      )
    }

    // Получаем существующие slugs для проверки уникальности
    const existingSlugs = await prisma.leadMagnet.findMany({
      where: { 
        specialistProfileId: session.specialistProfile!.id,
        slug: { not: null }
      },
      select: { slug: true }
    })

    // Генерируем уникальный slug
    const slug = generateSlug(
      data.title,
      existingSlugs.map(lm => lm.slug).filter(Boolean) as string[]
    )

    // Получаем максимальный order
    const maxOrder = await prisma.leadMagnet.findFirst({
      where: { specialistProfileId: session.specialistProfile!.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    // Генерируем fallback превью если не было загружено кастомное
    if (!previewUrls) {
      console.log('[Lead Magnet] Генерация fallback превью')
      try {
        const fallbackResult = await generateFallbackPreview({
          type: data.type as 'file' | 'link' | 'service',
          emoji: data.emoji
        })

        const uploadResult = await uploadFallbackPreview(fallbackResult.buffer, '')
        previewUrls = {
          thumbnail: uploadResult.thumbnail,
          card: uploadResult.card,
          detail: uploadResult.detail
        }
        console.log('[Lead Magnet] Fallback превью создано')
      } catch (error) {
        console.error('[Lead Magnet] Ошибка создания fallback превью:', error)
        // Продолжаем без превью
      }
    }

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
        // Новые поля
        slug,
        highlights: highlightsValidation.sanitized,
        targetAudience: data.targetAudience,
        fileSize: fileSize,
        ogImage: data.ogImage,
        // Превью
        previewUrls: previewUrls ? (previewUrls as any) : null,
      }
    })

    // Инвалидируем кеш профиля для мгновенного отображения
    const specialistProfile = await prisma.specialistProfile.findUnique({
      where: { id: session.specialistProfile!.id },
      select: { slug: true }
    })
    if (specialistProfile) {
      await revalidateSpecialistProfile(specialistProfile.slug)
    }

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

