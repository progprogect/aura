/**
 * Поле ввода сообщения в чате
 */

'use client'

import { useState, FormEvent, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 min-w-0 px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-32 leading-normal"
        style={{
          minHeight: '44px',
          maxHeight: '128px',
          lineHeight: '1.5',
          fontSize: '16px', // КРИТИЧНО: минимум 16px чтобы iOS НЕ зуммил!
        }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement
          target.style.height = '44px'
          target.style.height = `${Math.min(target.scrollHeight, 128)}px`
        }}
      />
      
      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || disabled}
        className="h-11 w-11 sm:h-12 sm:w-12 rounded-full shrink-0 flex items-center justify-center"
      >
        <Send className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </form>
  )
}
