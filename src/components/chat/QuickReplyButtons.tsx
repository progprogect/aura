/**
 * Кнопки быстрого ответа
 */

'use client'

import { Button } from '@/components/ui/button'

interface QuickReplyButtonsProps {
  buttons: string[]
  onReply: (reply: string) => void
}

export function QuickReplyButtons({ buttons, onReply }: QuickReplyButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onReply(button)}
          className="rounded-full"
        >
          {button}
        </Button>
      ))}
    </div>
  )
}

