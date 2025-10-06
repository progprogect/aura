/**
 * История диалогов (показывает прошлые сессии)
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Clock, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ChatMessage } from '@/hooks/useChatSession'

interface HistorySession {
  sessionId: string
  firstMessage: string
  timestamp: number
  messageCount: number
}

interface ChatHistoryProps {
  currentSessionId: string | null
  onLoadSession: (sessionId: string) => void
}

export function ChatHistory({ currentSessionId, onLoadSession }: ChatHistoryProps) {
  const [history, setHistory] = useState<HistorySession[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [currentSessionId])

  const loadHistory = () => {
    if (typeof window === 'undefined') return

    const sessions: HistorySession[] = []
    
    // Ищем все сессии в localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('aura_chat_session_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          if (data.messages && data.messages.length > 0 && data.sessionId !== currentSessionId) {
            const firstUserMessage = data.messages.find((m: ChatMessage) => m.role === 'user')
            if (firstUserMessage) {
              sessions.push({
                sessionId: data.sessionId,
                firstMessage: firstUserMessage.content,
                timestamp: data.createdAt || data.updatedAt || Date.now(),
                messageCount: data.messages.length,
              })
            }
          }
        } catch (e) {
          console.error('[Chat History] Failed to parse session:', e)
        }
      }
    }

    // Сортируем по дате (новые сверху)
    sessions.sort((a, b) => b.timestamp - a.timestamp)
    
    setHistory(sessions.slice(0, 5)) // Показываем только 5 последних
  }

  const handleLoadSession = (sessionId: string) => {
    onLoadSession(sessionId)
    setIsOpen(false)
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дн. назад`
    return date.toLocaleDateString('ru-RU')
  }

  if (history.length === 0) return null

  return (
    <>
      {/* Кнопка открытия */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Clock className="w-4 h-4" />
        <span className="hidden md:inline">История ({history.length})</span>
      </Button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-card border-r border-border z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold">История диалогов</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Список сессий */}
              <div className="p-2">
                {history.map((session) => (
                  <motion.button
                    key={session.sessionId}
                    onClick={() => handleLoadSession(session.sessionId)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors mb-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 mb-1">
                          {session.firstMessage}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatTimestamp(session.timestamp)}</span>
                          <span>•</span>
                          <span>{session.messageCount} сообщ.</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

