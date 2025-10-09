/**
 * Страница входа для обычных пользователей
 */

import type { Metadata } from 'next'
import { AuthUserLoginForm } from '@/components/auth/AuthUserLoginForm'

export const metadata: Metadata = {
  title: 'Вход | Aura',
  description: 'Войдите в свой аккаунт Aura',
  robots: {
    index: false,
    follow: false,
  },
}

export default function UserLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Основной контент */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Форма входа */}
          <AuthUserLoginForm />
        </div>
      </div>
    </div>
  )
}

