/**
 * API для тестирования semantic search
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchSpecialistsBySemantic } from '@/lib/ai/semantic-search'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, filters, limit } = body

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const results = await searchSpecialistsBySemantic({
      query,
      filters,
      limit: limit || 10,
    })

    return NextResponse.json({
      success: true,
      count: results.length,
      results: results.map((s: any) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        category: s.category,
        specializations: s.specializations,
        distance: s.distance,
      })),
    })
  } catch (error) {
    console.error('[Search API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

