/**
 * Страница входа для специалистов
 */

import { Metadata } from 'next'
import { AuthLoginFormWrapper } from '@/components/auth/AuthLoginFormWrapper'
import { AuthNavigation } from '@/components/auth/AuthNavigation'

export const metadata: Metadata = {
  title: 'Вход для специалистов | Аура',
  description: 'Войдите в личный кабинет специалиста для управления профилем и заявками',
  robots: {
    index: false, // Не индексируем страницы авторизации
    follow: false,
  },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Основной контент */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Форма входа */}
          <AuthLoginFormWrapper />
        </div>
      </div>
    </div>
  )
}
