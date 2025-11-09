/**
 * Единая страница входа для всех типов пользователей
 */

import { Metadata } from 'next'
import { AuthUnifiedLoginForm } from '@/components/auth/AuthUnifiedLoginForm'

export const metadata: Metadata = {
  title: 'Вход | Эколюция 360',
  description: 'Войдите в свой аккаунт Эколюция 360',
  robots: {
    index: false,
    follow: false,
  },
}

export default function UnifiedLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Основной контент */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Единая форма входа */}
          <AuthUnifiedLoginForm />
        </div>
      </div>
    </div>
  )
}