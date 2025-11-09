/**
 * Страница создания заявки
 * Альтернативный путь для создания заявки (если не используется Hero section)
 */

import { Metadata } from 'next'
import { RequestQuiz } from '@/components/requests/RequestQuiz'

export const metadata: Metadata = {
  title: 'Создать заявку | Эколюция 360',
  description: 'Создайте заявку на поиск специалиста',
}

export default function CreateRequestPage() {
  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Создать заявку</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Заполните форму, и специалисты предложат вам свои услуги
          </p>
        </div>
        <RequestQuiz />
      </div>
    </div>
  )
}

