/**
 * Страница списка заявок пользователя
 */

import { Metadata } from 'next'
import { RequestsList } from '@/components/requests/RequestsList'

export const metadata: Metadata = {
  title: 'Мои заявки | Эколюция 360',
  description: 'Просмотр и управление вашими заявками',
}

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <RequestsList />
      </div>
    </div>
  )
}

