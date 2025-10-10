/**
 * API: Проверка статуса генерации превью
 * GET /api/lead-magnet/preview/status/:jobId
 */

import { NextRequest, NextResponse } from 'next/server'
import { getJobStatus } from '@/lib/queue/preview-queue'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const status = await getJobStatus(jobId)

    return NextResponse.json({
      success: true,
      jobId,
      ...status
    })

  } catch (error) {
    console.error('[Preview Status API] Ошибка:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

