import { NextRequest, NextResponse } from 'next/server'
import { incrementContactView } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { specialistId, contactType } = await request.json()

    if (!specialistId || !contactType) {
      return NextResponse.json(
        { error: 'specialistId and contactType are required' },
        { status: 400 }
      )
    }

    await incrementContactView(specialistId, contactType)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking contact view:', error)
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}



