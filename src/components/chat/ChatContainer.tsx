/**
 * Основной контейнер чата
 */

'use client'

import { useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ChatHistory } from './ChatHistory'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, Sparkles, Undo2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ChatContainer() {
  const { messages, sendMessage, isLoading, reset, undoLastMessage, loadSession, sessionId } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto bg-background overflow-x-hidden" style={{ height: '100dvh' }}>
      {/* Header - фиксированный и компактный на мобильных */}
      <div className="flex-shrink-0 bg-background border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="w-4 h-4" />
              <span className="ml-2 md:hidden">Назад</span>
            </Link>
          </Button>
          <div className="border-l border-border pl-2 sm:pl-3 min-w-0">
            <h1 className="font-semibold text-sm sm:text-base md:text-lg flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <span className="truncate">AI-Помощник</span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Помогу найти идеального специалиста
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChatHistory 
            currentSessionId={sessionId} 
            onLoadSession={loadSession}
          />
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Начать новый поиск? Текущая переписка будет очищена.')) {
                  reset()
                }
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Начать заново</span>
            </Button>
          )}
        </div>
      </div>

      {/* Messages - скроллируемая область */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4 sm:py-6 space-y-4 min-h-0"
      >
        {/* Приветствие если нет сообщений */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 space-y-6"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2">
                Привет! Я AI-помощник Ауры 👋
              </h2>
              <p className="text-muted-foreground mb-4">
                Помогу вам найти подходящего специалиста
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                Примеры запросов:
              </p>
              <div className="grid gap-2">
                {[
                  'Хочу найти психолога для работы с тревогой',
                  'Нужен фитнес-тренер для похудения',
                  'Ищу нутрициолога для набора массы',
                  'Помогите выбрать массажиста в Москве',
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(example)}
                    className="text-sm text-left px-4 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Сообщения */}
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onQuickReply={sendMessage}
            />
          ))}
        </AnimatePresence>

        {/* Индикатор печати */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-start"
          >
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - фиксированный */}
      <div className="flex-shrink-0 bg-background border-t px-3 sm:px-4 py-3 sm:py-4">
        {/* Кнопка возврата */}
        {messages.length >= 2 && !isLoading && (
          <div className="mb-2 sm:mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={undoLastMessage}
              className="gap-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
            >
              <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Вернуться к предыдущему шагу</span>
              <span className="sm:hidden">Назад</span>
            </Button>
          </div>
        )}
        
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          placeholder={
            messages.length === 0
              ? 'Напишите, с чем нужна помощь...'
              : 'Ваше сообщение...'
          }
        />
        <p className="text-xs text-muted-foreground text-center mt-1.5 sm:mt-2">
          AI может ошибаться. Проверяйте важную информацию.
        </p>
      </div>
    </div>
  )
}

