/**
 * История диалогов (показывает прошлые сессии)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
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
  onClose?: () => void
}

export function ChatHistory({ currentSessionId, onLoadSession, onClose }: ChatHistoryProps) {
  const [history, setHistory] = useState<HistorySession[]>([])
  const [isOpen, setIsOpen] = useState(true) // Управляется родителем

  const loadHistory = useCallback(() => {
    if (typeof window === 'undefined') return

    const sessions: HistorySession[] = []
    
    // Ищем все сессии в localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      // Игнорируем ключ с текущей сессией и ищем только сессии с UUID
      if (key && key.startsWith('aura_chat_session_') && key !== 'aura_chat_session_current') {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          console.log('[Chat History] Found session:', key, 'Messages:', data.messages?.length || 0)
          
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
    
    console.log('[Chat History] Total sessions found:', sessions.length)

    // Сортируем по дате (новые сверху)
    sessions.sort((a, b) => b.timestamp - a.timestamp)
    
    setHistory(sessions.slice(0, 5)) // Показываем только 5 последних
  }, [currentSessionId])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleLoadSession = (sessionId: string) => {
    onLoadSession(sessionId)
    if (onClose) onClose()
  }
  
  const handleClose = () => {
    if (onClose) onClose()
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

  if (history.length === 0) {
    // Если истории нет - показываем сообщение
    return (
      <>
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
        />
        
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 bottom-0 w-80 bg-card border-r border-border z-[101] overflow-y-auto shadow-2xl"
        >
          <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold">История диалогов</h3>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 text-center text-muted-foreground text-sm">
            История диалогов пуста
          </div>
        </motion.div>
      </>
    )
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 bottom-0 w-80 bg-card border-r border-border z-[101] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold">История диалогов</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
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
  )
}

