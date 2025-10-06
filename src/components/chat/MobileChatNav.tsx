/**
 * Минималистичная навигация для мобильного чата
 * Простые кнопки над input'ом
 */

'use client'

import { ArrowLeft, Clock, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobileChatNavProps {
  onOpenHistory: () => void
  onNewChat: () => void
}

export function MobileChatNav({ onOpenHistory, onNewChat }: MobileChatNavProps) {
  const router = useRouter()

  return (
    <div className="md:hidden flex items-center justify-center gap-1 py-2 border-t border-border/50">
      {/* Назад */}
      <button
        onClick={() => router.push('/')}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-muted-foreground hover:text-foreground active:bg-muted/50 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-xs">Назад</span>
      </button>

      {/* История */}
      <button
        onClick={onOpenHistory}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-muted-foreground hover:text-foreground active:bg-muted/50 rounded-lg transition-colors"
      >
        <Clock className="w-5 h-5" />
        <span className="text-xs">История</span>
      </button>

      {/* Новый чат */}
      <button
        onClick={onNewChat}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-muted-foreground hover:text-foreground active:bg-muted/50 rounded-lg transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="text-xs">Новый</span>
      </button>
    </div>
  )
}

