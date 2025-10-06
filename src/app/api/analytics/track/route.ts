/**
 * API для трекинга аналитики из client компонентов
 */

import { NextRequest, NextResponse } from 'next/server'
import { trackChatEvent, ChatEvent } from '@/lib/analytics/chat-analytics'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, sessionId, metadata } = body

    // Валидация
    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'Event is required' }, { status: 400 })
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Маппинг строковых событий в enum
    const eventMap: Record<string, ChatEvent> = {
      session_started: ChatEvent.SESSION_STARTED,
      message_sent: ChatEvent.MESSAGE_SENT,
      recommendations_shown: ChatEvent.RECOMMENDATIONS_SHOWN,
      profile_clicked: ChatEvent.PROFILE_CLICKED,
      catalog_clicked: ChatEvent.CATALOG_CLICKED,
      chat_completed: ChatEvent.CHAT_COMPLETED,
      chat_abandoned: ChatEvent.CHAT_ABANDONED,
    }

    const chatEvent = eventMap[event]

    if (!chatEvent) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    // Трекаем событие
    await trackChatEvent(chatEvent, sessionId, metadata || {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Analytics API] Error:', error)
    // Не возвращаем ошибку 500 - аналитика не должна ломать UX
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

