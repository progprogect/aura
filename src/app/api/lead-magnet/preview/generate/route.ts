/**
 * API: Генерация превью для лид-магнита (с queue)
 * POST /api/lead-magnet/preview/generate
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addGeneratePreviewJob } from '@/lib/queue/preview-queue'
import { fromPrismaLeadMagnet } from '@/types/lead-magnet'

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

    // Добавляем задачу в очередь
    const jobId = await addGeneratePreviewJob({
      leadMagnetId: typedLeadMagnet.id,
      type: typedLeadMagnet.type,
      fileUrl: typedLeadMagnet.fileUrl,
      linkUrl: typedLeadMagnet.linkUrl,
      ogImage: typedLeadMagnet.ogImage,
      title: typedLeadMagnet.title,
      description: typedLeadMagnet.description,
      emoji: typedLeadMagnet.emoji,
      highlights: typedLeadMagnet.highlights
    })

    if (!jobId) {
      // Queue недоступна - возвращаем ошибку
      return NextResponse.json(
        { 
          error: 'Queue unavailable', 
          message: 'Preview generation queue is not configured' 
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Preview generation job added to queue'
    })

  } catch (error) {
    console.error('[Generate Preview API] Ошибка:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

