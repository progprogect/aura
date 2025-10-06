/**
 * Кнопки быстрого ответа
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface QuickReplyButtonsProps {
  buttons: string[]
  onReply: (reply: string) => void
}

export function QuickReplyButtons({ buttons, onReply }: QuickReplyButtonsProps) {
  const router = useRouter()
  
  const handleClick = (button: string) => {
    // Специальная обработка для редиректов
    if (button.toLowerCase().includes('каталог') || button.toLowerCase().includes('catalog')) {
      router.push('/catalog')
      return
    }
    
    // Обычный ответ
    onReply(button)
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleClick(button)}
          className="rounded-full"
        >
          {button}
        </Button>
      ))}
    </div>
  )
}

