/**
 * Страница входа для специалистов
 */

import { Metadata } from 'next'
import { AuthLoginForm } from '@/components/auth/AuthLoginForm'
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
      {/* Навигация */}
      <AuthNavigation />
      
      {/* Основной контент */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Добро пожаловать!
            </h1>
            <p className="text-muted-foreground">
              Войдите в личный кабинет специалиста
            </p>
          </div>
          
          {/* Форма входа */}
          <AuthLoginForm />
          
          {/* Ссылка на регистрацию */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Ещё нет аккаунта?{' '}
              <a 
                href="/auth/register" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Зарегистрироваться
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
