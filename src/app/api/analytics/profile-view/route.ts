import { NextRequest, NextResponse } from 'next/server'
import { incrementProfileView } from '@/lib/redis'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { specialistId } = await request.json()

    if (!specialistId) {
      return NextResponse.json({ error: 'specialistId is required' }, { status: 400 })
    }

    await incrementProfileView(specialistId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking profile view:', error)
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}



