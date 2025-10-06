/**
 * Компонент сообщения в чате
 */

'use client'

import { motion } from 'framer-motion'
import { ChatMessage as ChatMessageType } from '@/hooks/useChatSession'
import { SpecialistRecommendation } from './SpecialistRecommendation'
import { QuickReplyButtons } from './QuickReplyButtons'

interface ChatMessageProps {
  message: ChatMessageType
  onQuickReply?: (reply: string) => void
}

export function ChatMessage({ message, onQuickReply }: ChatMessageProps) {
  const isUser = message.role === 'user'

  // DEBUG: Логируем specialists для assistant сообщений
  if (!isUser) {
    console.log('[ChatMessage] Rendering assistant message:', {
      id: message.id,
      hasSpecialists: !!message.specialists,
      specialistsCount: message.specialists?.length || 0,
      specialists: message.specialists,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-3`}>
        {/* Сообщение */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Кнопки быстрого ответа */}
        {!isUser && message.buttons && message.buttons.length > 0 && onQuickReply && (
          <QuickReplyButtons buttons={message.buttons} onReply={onQuickReply} />
        )}

        {/* Карточки специалистов */}
        {!isUser && message.specialists && message.specialists.length > 0 && (
          <div className="w-full space-y-3 mt-2">
            {message.specialists.map((specialist, index) => (
              <SpecialistRecommendation 
                key={specialist.id} 
                specialist={specialist}
                sessionId={message.sessionId}
                index={index}
                onFindSimilar={(specialistId) => {
                  // Отправляем запрос "Найти похожих на X"
                  if (onQuickReply) {
                    const specialist = message.specialists?.find(s => s.id === specialistId)
                    if (specialist) {
                      onQuickReply(`Найти похожих на ${specialist.firstName} ${specialist.lastName}`)
                    }
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

