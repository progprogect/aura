/**
 * Страница регистрации для специалистов
 */

import { Metadata } from 'next'
import { AuthRegisterForm } from '@/components/auth/AuthRegisterForm'
import { AuthNavigation } from '@/components/auth/AuthNavigation'

export const metadata: Metadata = {
  title: 'Регистрация специалиста | Аура',
  description: 'Зарегистрируйтесь как специалист и начните принимать заявки от клиентов',
  robots: {
    index: false, // Не индексируем страницы авторизации
    follow: false,
  },
}

export default function RegisterPage() {
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
              Присоединяйтесь к Ауре
            </h1>
            <p className="text-muted-foreground">
              Зарегистрируйтесь как специалист и начните помогать людям
            </p>
          </div>
          
          {/* Форма регистрации */}
          <AuthRegisterForm />
          
          {/* Ссылка на вход */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <a 
                href="/auth/login" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Войти
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
