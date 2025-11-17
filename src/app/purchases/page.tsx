/**
 * Страница покупок пользователя
 */

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/server'
import { PurchasesPageContent } from '@/components/purchases/PurchasesPageContent'

export default async function PurchasesPage() {
  // Проверяем авторизацию
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои покупки</h1>
          <p className="text-gray-600">
            Здесь вы можете отслеживать все ваши заказы и покупки
          </p>
        </div>

        {/* Контент с табами */}
        <PurchasesPageContent />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Мои покупки | Эволюция 360',
  description: 'Отслеживайте статус ваших заказов и покупок',
}
