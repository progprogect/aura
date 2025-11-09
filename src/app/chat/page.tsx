/**
 * Страница умного AI-чата
 */

import { Metadata } from 'next'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { ErrorBoundary, ChatErrorFallback } from '@/components/ui/error-boundary'

export const metadata: Metadata = {
  title: 'Умный AI-помощник — Эколюция 360',
  description: 'Персональный подбор экспертов для развития и баланса с помощью интеллектуальных вопросов и AI-ранжирования',
}

export default function ChatPage() {
  return (
    <ErrorBoundary fallback={ChatErrorFallback}>
      <ChatContainer />
    </ErrorBoundary>
  )
}

