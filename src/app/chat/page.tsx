/**
 * Страница AI-чата
 */

import { Metadata } from 'next'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { ChatErrorBoundary } from '@/components/chat/ChatErrorBoundary'

export const metadata: Metadata = {
  title: 'AI-Помощник — Аура',
  description: 'Персональный подбор специалиста с помощью искусственного интеллекта',
}

export default function ChatPage() {
  return (
    <ChatErrorBoundary>
      <ChatContainer />
    </ChatErrorBoundary>
  )
}

