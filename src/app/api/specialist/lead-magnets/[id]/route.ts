/**
 * API для управления конкретным лид-магнитом
 * PUT - редактирование лид-магнита
 * DELETE - удаление лид-магнита
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { uploadImage, uploadDocument, uploadPDF, uploadCustomPreview, uploadFallbackPreview, deletePreview } from '@/lib/cloudinary/config'
import { getAuthSession, UNAUTHORIZED_RESPONSE } from '@/lib/auth/api-auth'
import { generateSlug, formatFileSize, validateHighlights } from '@/lib/lead-magnets/utils'
import { revalidateSpecialistProfile } from '@/lib/revalidation'
import { LEAD_MAGNET_LIMITS, FALLBACK_PREVIEW_URL } from '@/lib/lead-magnets/constants'
import type { PreviewUrls } from '@/types/lead-magnet'

const UpdateLeadMagnetSchema = z.object({
  type: z.enum(['file', 'link', 'service']),
  title: z.string().min(LEAD_MAGNET_LIMITS.TITLE_MIN_LENGTH).max(LEAD_MAGNET_LIMITS.TITLE_MAX_LENGTH),
  description: z.string().min(LEAD_MAGNET_LIMITS.DESCRIPTION_MIN_LENGTH).max(LEAD_MAGNET_LIMITS.DESCRIPTION_MAX_LENGTH),
  fileUrl: z.string().optional(),
  linkUrl: z.string().url().optional().or(z.literal('')),
  emoji: z.string().default('🎁'),
  // Новые опциональные поля
  highlights: z.array(z.string()).max(LEAD_MAGNET_LIMITS.MAX_HIGHLIGHTS).optional(),
  targetAudience: z.string().max(LEAD_MAGNET_LIMITS.TARGET_AUDIENCE_MAX_LENGTH).optional(),
  ogImage: z.string().url().optional().or(z.literal('')),
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
    let fileSize: string | null = null
    let previewUrls: PreviewUrls | null = null
    let shouldUpdatePreview = false

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
      const ogImage = formData.get('ogImage') as string || undefined
      const fileUrlForm = formData.get('fileUrl') as string || undefined
      const linkUrl = formData.get('linkUrl') as string || undefined
      const removePreview = formData.get('removePreview') === 'true'

      // Загружаем файл лид-магнита только если он есть
      let fileUrl = fileUrlForm
      if (file && file.size > 0) {
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
        
        fileUrl = uploadResult.url
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
        fileUrl,
        linkUrl,
        emoji,
        highlights,
        targetAudience,
        ogImage,
      }

      // Обработка превью
      if (previewFile && previewFile.size > 0) {
        // Кастомное превью загружено - нужно обновить
        console.log('[Lead Magnet] Загрузка нового кастомного превью')
        shouldUpdatePreview = true
        
        // Удаляем старое кастомное превью из Cloudinary, если оно было
        const existingLeadMagnet = await prisma.leadMagnet.findUnique({
          where: { id: params.id },
          select: { previewUrls: true }
        })
        
        if (existingLeadMagnet?.previewUrls) {
          const oldPreviewUrls = existingLeadMagnet.previewUrls as any
          // Проверяем, что это кастомное превью (не fallback SVG)
          if (oldPreviewUrls.card && !oldPreviewUrls.card.includes('/images/fallback-preview.svg')) {
            try {
              // Извлекаем public_id из URL и удаляем из Cloudinary
              const publicIdMatch = oldPreviewUrls.card.match(/custom-previews\/(.+?)(?:_\d+x\d+)?\./)
              if (publicIdMatch) {
                const publicId = `custom-previews/${publicIdMatch[1]}`
                await deletePreview(publicId)
                console.log('[Lead Magnet] Старое кастомное превью удалено из Cloudinary')
              }
            } catch (error) {
              console.error('[Lead Magnet] Ошибка удаления старого превью:', error)
              // Продолжаем, даже если не удалось удалить старое
            }
          }
        }
        
        try {
          const bytes = await previewFile.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          const previewResult = await uploadCustomPreview(buffer, params.id)
          previewUrls = {
            thumbnail: previewResult.thumbnail,
            card: previewResult.card,
            detail: previewResult.detail
          }
          console.log('[Lead Magnet] Новое кастомное превью загружено')
        } catch (error) {
          console.error('[Lead Magnet] Ошибка загрузки нового превью:', error)
        }
      } else if (removePreview) {
        // Пользователь удалил превью - используем fallback
        console.log('[Lead Magnet] Превью удалено, используем fallback')
        shouldUpdatePreview = true
        
        // Удаляем старое кастомное превью из Cloudinary
        const existingLeadMagnet = await prisma.leadMagnet.findUnique({
          where: { id: params.id },
          select: { previewUrls: true }
        })
        
        if (existingLeadMagnet?.previewUrls) {
          const oldPreviewUrls = existingLeadMagnet.previewUrls as any
          // Проверяем, что это кастомное превью (не fallback SVG)
          if (oldPreviewUrls.card && !oldPreviewUrls.card.includes('/images/fallback-preview.svg')) {
            try {
              // Извлекаем public_id из URL и удаляем из Cloudinary
              const publicIdMatch = oldPreviewUrls.card.match(/custom-previews\/(.+?)(?:_\d+x\d+)?\./)
              if (publicIdMatch) {
                const publicId = `custom-previews/${publicIdMatch[1]}`
                await deletePreview(publicId)
                console.log('[Lead Magnet] Старое кастомное превью удалено из Cloudinary')
              }
            } catch (error) {
              console.error('[Lead Magnet] Ошибка удаления старого превью:', error)
              // Продолжаем
            }
          }
        }
        
        previewUrls = {
          thumbnail: FALLBACK_PREVIEW_URL,
          card: FALLBACK_PREVIEW_URL,
          detail: FALLBACK_PREVIEW_URL
        }
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

    // Валидируем highlights если они есть
    let sanitizedHighlights = data.highlights
    if (data.highlights && data.highlights.length > 0) {
      const highlightsValidation = validateHighlights(data.highlights)
      if (!highlightsValidation.valid) {
        return NextResponse.json(
          { success: false, error: highlightsValidation.error },
          { status: 400 }
        )
      }
      sanitizedHighlights = highlightsValidation.sanitized
    }

    // Проверяем, изменился ли title - если да, регенерируем slug
    const currentLeadMagnet = await prisma.leadMagnet.findUnique({
      where: { id: params.id },
      select: { title: true, slug: true, specialistProfileId: true }
    })

    let newSlug = currentLeadMagnet?.slug
    if (currentLeadMagnet && data.title !== currentLeadMagnet.title) {
      // Получаем существующие slugs
      const existingSlugs = await prisma.leadMagnet.findMany({
        where: { 
          specialistProfileId: currentLeadMagnet.specialistProfileId,
          slug: { not: null },
          id: { not: params.id } // Исключаем текущий лид-магнит
        },
        select: { slug: true }
      })

      newSlug = generateSlug(
        data.title,
        existingSlugs.map(lm => lm.slug).filter(Boolean) as string[]
      )
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      type: data.type,
      title: data.title,
      description: data.description,
      emoji: data.emoji,
    }

    // Добавляем опциональные поля только если они указаны
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl
    if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl
    if (sanitizedHighlights !== undefined) updateData.highlights = sanitizedHighlights
    if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience
    if (data.ogImage !== undefined) updateData.ogImage = data.ogImage
    if (fileSize !== null) updateData.fileSize = fileSize
    if (newSlug !== currentLeadMagnet?.slug) updateData.slug = newSlug
    
    // Обновляем превью если было загружено новое
    if (shouldUpdatePreview && previewUrls) {
      updateData.previewUrls = previewUrls as any
      console.log('[Lead Magnet] PreviewUrls обновлены в БД')
    }

    const updatedLeadMagnet = await prisma.leadMagnet.update({
      where: { id: params.id },
      data: updateData
    })

    // Инвалидируем кеш профиля
    const specialistProfile = await prisma.specialistProfile.findUnique({
      where: { id: leadMagnet.specialistProfileId },
      select: { slug: true }
    })
    if (specialistProfile) {
      await revalidateSpecialistProfile(specialistProfile.slug)
    }

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

    // Инвалидируем кеш профиля
    const specialistProfile = await prisma.specialistProfile.findUnique({
      where: { id: leadMagnet.specialistProfileId },
      select: { slug: true }
    })
    if (specialistProfile) {
      await revalidateSpecialistProfile(specialistProfile.slug)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[API/lead-magnets/DELETE] Ошибка:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

