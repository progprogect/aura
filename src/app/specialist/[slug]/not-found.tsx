/**
 * Кастомная страница 404 для профилей специалистов
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, User } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Иконка */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Профиль не найден
        </h1>

        {/* Описание */}
        <p className="text-lg text-gray-600 mb-8">
          К сожалению, профиль специалиста не найден. 
          Возможно, ссылка устарела или содержит ошибку.
        </p>

        {/* Советы */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-blue-900 font-medium mb-2">
            💡 Что можно сделать:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Проверьте правильность ссылки</li>
            <li>Вернитесь на главную и найдите специалиста через каталог</li>
            <li>Если вы владелец профиля - зайдите в личный кабинет</li>
          </ul>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" variant="default">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              На главную
            </Link>
          </Button>
          
          <Button asChild size="lg" variant="outline">
            <Link href="/profile">
              <User className="w-4 h-4 mr-2" />
              Мой профиль
            </Link>
          </Button>
        </div>

        {/* Дополнительная помощь */}
        <p className="mt-8 text-sm text-gray-500">
          Нужна помощь?{' '}
          <Link href="/support" className="text-blue-600 hover:underline">
            Свяжитесь с поддержкой
          </Link>
        </p>
      </div>
    </div>
  )
}

