/**
 * Поле ввода сообщения в чате с голосовым вводом
 */

'use client'

import { useState, FormEvent, KeyboardEvent, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Mic, MicOff } from 'lucide-react'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { motion } from 'framer-motion'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Напишите сообщение...',
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const { 
    isListening, 
    transcript, 
    isSupported, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useVoiceInput()

  // Обновляем input когда получаем транскрипт
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
      resetTranscript()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Слушаю...' : placeholder}
          disabled={disabled}
          rows={1}
          className="w-full px-3 sm:px-4 py-3 pr-11 rounded-2xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-32 text-sm sm:text-base leading-normal"
          style={{
            minHeight: '48px',
            maxHeight: '128px',
            lineHeight: '1.5',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = '48px'
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`
          }}
        />
        
        {/* Кнопка микрофона внутри поля */}
        {isSupported && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={toggleVoiceInput}
              disabled={disabled}
              className={`h-8 w-8 p-0 rounded-full ${isListening ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <MicOff className="h-4 w-4" />
                </motion.div>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
      
      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || disabled}
        className="h-12 w-12 rounded-full shrink-0 flex items-center justify-center"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  )
}
