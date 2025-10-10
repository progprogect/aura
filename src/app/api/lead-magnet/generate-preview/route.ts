/**
 * API endpoint для генерации превью лид-магнитов
 * POST /api/lead-magnet/generate-preview
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateUniversalPreview } from '@/lib/lead-magnets/preview-generator-universal'
import { fromPrismaLeadMagnet } from '@/types/lead-magnet'

// Временное хранилище для превью (в реальном проекте - S3/Cloudinary)
// TODO: Интегрировать с существующим upload сервисом
async function uploadPreviewToStorage(buffer: Buffer, leadMagnetId: string): Promise<string> {
  // Для MVP - конвертируем в base64 data URL
  // В продакшене - загружаем в S3/Cloudinary
  const base64 = buffer.toString('base64')
  const dataUrl = `data:image/webp;base64,${base64}`
  
  // TODO: Заменить на реальную загрузку в storage
  // const uploadedUrl = await uploadToCloudinary(buffer, `lead-magnet-preview-${leadMagnetId}`)
  
  return dataUrl
}

/**
 * Генерирует превью для лид-магнита
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadMagnetId } = body

    if (!leadMagnetId) {
      return NextResponse.json(
        { error: 'Lead magnet ID is required' },
        { status: 400 }
      )
    }

    // Получаем лид-магнит из БД
    const leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id: leadMagnetId }
    })

    if (!leadMagnet) {
      return NextResponse.json(
        { error: 'Lead magnet not found' },
        { status: 404 }
      )
    }

    // Конвертируем в типизированный объект
    const typedLeadMagnet = fromPrismaLeadMagnet(leadMagnet)

    // Генерируем превью
    const result = await generateUniversalPreview({
      type: typedLeadMagnet.type,
      fileUrl: typedLeadMagnet.fileUrl,
      linkUrl: typedLeadMagnet.linkUrl,
      ogImage: typedLeadMagnet.ogImage,
      title: typedLeadMagnet.title,
      description: typedLeadMagnet.description,
      emoji: typedLeadMagnet.emoji,
      highlights: typedLeadMagnet.highlights
    })

    if (!result.success || !result.previewBuffer) {
      return NextResponse.json(
        { 
          error: 'Failed to generate preview', 
          details: result.error 
        },
        { status: 500 }
      )
    }

    // Сохраняем превью в storage
    const previewUrl = await uploadPreviewToStorage(result.previewBuffer, leadMagnetId)

    // Обновляем лид-магнит с URL превью
    await prisma.leadMagnet.update({
      where: { id: leadMagnetId },
      data: { previewImage: previewUrl }
    })

    return NextResponse.json({
      success: true,
      previewUrl,
      previewType: result.previewType
    })

  } catch (error) {
    console.error('[Generate Preview API] Ошибка:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * Регенерирует превью для всех лид-магнитов без превью (админ эндпоинт)
 * POST /api/lead-magnet/generate-preview?regenerateAll=true
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const regenerateAll = searchParams.get('regenerateAll') === 'true'

  if (!regenerateAll) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    // Получаем все лид-магниты без превью
    const leadMagnets = await prisma.leadMagnet.findMany({
      where: {
        previewImage: null,
        isActive: true
      }
    })

    const results = []

    for (const leadMagnet of leadMagnets) {
      try {
        const typedLeadMagnet = fromPrismaLeadMagnet(leadMagnet)
        
        const result = await generateUniversalPreview({
          type: typedLeadMagnet.type,
          fileUrl: typedLeadMagnet.fileUrl,
          linkUrl: typedLeadMagnet.linkUrl,
          ogImage: typedLeadMagnet.ogImage,
          title: typedLeadMagnet.title,
          description: typedLeadMagnet.description,
          emoji: typedLeadMagnet.emoji,
          highlights: typedLeadMagnet.highlights
        })

        if (result.success && result.previewBuffer) {
          const previewUrl = await uploadPreviewToStorage(result.previewBuffer, leadMagnet.id)
          
          await prisma.leadMagnet.update({
            where: { id: leadMagnet.id },
            data: { previewImage: previewUrl }
          })

          results.push({
            id: leadMagnet.id,
            title: leadMagnet.title,
            success: true,
            previewType: result.previewType
          })
        } else {
          results.push({
            id: leadMagnet.id,
            title: leadMagnet.title,
            success: false,
            error: result.error
          })
        }
      } catch (error) {
        results.push({
          id: leadMagnet.id,
          title: leadMagnet.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      total: leadMagnets.length,
      results
    })

  } catch (error) {
    console.error('[Regenerate Previews] Ошибка:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

