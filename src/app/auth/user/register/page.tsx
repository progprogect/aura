/**
 * Страница регистрации для обычных пользователей
 */

import type { Metadata } from 'next'
import { AuthUserRegisterForm } from '@/components/auth/AuthUserRegisterForm'

export const metadata: Metadata = {
  title: 'Регистрация | Aura',
  description: 'Создайте аккаунт в Aura',
  robots: {
    index: false,
    follow: false,
  },
}

export default function UserRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Основной контент */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Форма регистрации */}
          <AuthUserRegisterForm />
        </div>
      </div>
    </div>
  )
}

