/**
 * API: Массовая генерация превью (admin)
 * POST /api/lead-magnet/preview/batch
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addBatchGenerateJob } from '@/lib/queue/preview-queue'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadMagnetIds, regenerateAll } = body

    let ids: string[] = []

    if (regenerateAll) {
      // Получаем все лид-магниты без превью
      const leadMagnets = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "LeadMagnet"
        WHERE "previewUrls" IS NULL OR "previewImage" IS NULL
      `

      ids = leadMagnets.map(lm => lm.id)
    } else if (leadMagnetIds && Array.isArray(leadMagnetIds)) {
      ids = leadMagnetIds
    } else {
      return NextResponse.json(
        { error: 'leadMagnetIds array or regenerateAll flag required' },
        { status: 400 }
      )
    }

    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No lead magnets to process',
        count: 0
      })
    }

    // Добавляем batch задачу
    const jobId = await addBatchGenerateJob(ids)

    if (!jobId) {
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
      count: ids.length,
      message: `Batch job created for ${ids.length} lead magnets`
    })

  } catch (error) {
    console.error('[Batch Preview API] Ошибка:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

