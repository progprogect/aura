/**
 * Страница умного AI-чата
 */

import { Metadata } from 'next'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { ErrorBoundary, ChatErrorFallback } from '@/components/ui/error-boundary'

export const metadata: Metadata = {
  title: 'Умный AI-Помощник — Аура',
  description: 'Персональный подбор специалиста через интеллектуальные вопросы и AI-ранжирование',
}

export default function ChatPage() {
  return (
    <ErrorBoundary fallback={ChatErrorFallback}>
      <ChatContainer />
    </ErrorBoundary>
  )
}

