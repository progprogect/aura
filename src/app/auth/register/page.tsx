/**
 * Страница регистрации для специалистов
 */

import { Metadata } from 'next'
import { AuthRegisterForm } from '@/components/auth/AuthRegisterForm'
import { AuthNavigation } from '@/components/auth/AuthNavigation'

export const metadata: Metadata = {
  title: 'Регистрация специалиста | Эколюция 360',
  description: 'Зарегистрируйтесь как специалист и начните принимать заявки от клиентов',
  robots: {
    index: false, // Не индексируем страницы авторизации
    follow: false,
  },
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Основной контент */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Форма регистрации */}
          <AuthRegisterForm />
        </div>
      </div>
    </div>
  )
}
