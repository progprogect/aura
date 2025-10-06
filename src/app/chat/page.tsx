/**
 * Страница AI-чата
 */

import { Metadata } from 'next'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { ErrorBoundary, ChatErrorFallback } from '@/components/ui/error-boundary'

export const metadata: Metadata = {
  title: 'AI-Помощник — Аура',
  description: 'Персональный подбор специалиста с помощью искусственного интеллекта',
}

export default function ChatPage() {
  return (
    <ErrorBoundary fallback={ChatErrorFallback}>
      <ChatContainer />
    </ErrorBoundary>
  )
}

