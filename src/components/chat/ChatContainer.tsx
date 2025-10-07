/**
 * Основной контейнер чата
 */

'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ChatHistory } from './ChatHistory'
import { MobileChatNav } from './MobileChatNav'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, Sparkles, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ChatContainer() {
  const { messages, sendMessage, isLoading, reset, loadSession, sessionId } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleOpenHistory = () => {
    setIsHistoryOpen(true)
  }

  const handleNewChat = () => {
    if (messages.length > 0) {
      if (confirm('Начать новый чат? Текущая переписка будет сохранена в истории.')) {
        reset()
      }
    }
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-4xl mx-auto bg-background overflow-x-hidden" style={{ height: '100dvh' }}>
      {/* Header - только на desktop */}
      <div className="hidden md:flex flex-shrink-0 bg-background border-b px-4 py-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Link>
          </Button>
          <div className="border-l border-border pl-3">
            <h1 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI-Помощник
            </h1>
            <p className="text-sm text-muted-foreground">
              Помогу найти идеального специалиста
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenHistory}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            История
          </Button>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Начать заново
            </Button>
          )}
        </div>
      </div>
      
      {/* История (управляется состоянием) */}
      {isHistoryOpen && (
        <ChatHistory 
          currentSessionId={sessionId} 
          onLoadSession={(id) => {
            loadSession(id)
            setIsHistoryOpen(false)
          }}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

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
      <div className="flex-shrink-0 bg-background">
        {/* Минималистичная навигация над input'ом (только мобильные) */}
        <MobileChatNav 
          onOpenHistory={handleOpenHistory}
          onNewChat={handleNewChat}
        />
        
        <div className="border-t px-2.5 sm:px-4 py-2.5 sm:py-4">
          
          <ChatInput
            onSend={sendMessage}
            disabled={isLoading}
            placeholder={
              messages.length === 0
                ? 'Напишите, с чем нужна помощь...'
                : 'Ваше сообщение...'
            }
          />
          <p className="text-xs text-muted-foreground text-center mt-1.5 sm:mt-2 hidden sm:block">
            AI может ошибаться. Проверяйте важную информацию.
          </p>
        </div>
      </div>
    </div>
  )
}

