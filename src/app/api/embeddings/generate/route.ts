/**
 * API для генерации embeddings
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateSpecialistEmbedding, generateAllEmbeddings } from '@/lib/ai/embeddings'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { specialistId, all } = body

    // Генерация для конкретного специалиста
    if (specialistId) {
      const embedding = await generateSpecialistEmbedding(specialistId)
      return NextResponse.json({ success: true, embedding: embedding.slice(0, 10) })
    }

    // Генерация для всех специалистов
    if (all) {
      const result = await generateAllEmbeddings()
      return NextResponse.json({ success: true, ...result })
    }

    return NextResponse.json({ error: 'Missing specialistId or all parameter' }, { status: 400 })
  } catch (error) {
    console.error('[Embeddings API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate embeddings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

