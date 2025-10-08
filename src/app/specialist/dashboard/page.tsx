/**
 * Dashboard специалиста
 * Показывается после входа
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { DashboardStats } from '@/components/specialist/dashboard/DashboardStats'
import { ProfileCompletionCard } from '@/components/specialist/dashboard/ProfileCompletionCard'
import { QuickActions } from '@/components/specialist/dashboard/QuickActions'

export const metadata = {
  title: 'Личный кабинет | Аура',
  description: 'Управление профилем специалиста',
  robots: 'noindex, nofollow',
}

async function getDashboardData() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value

  if (!sessionToken) {
    return null
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/specialist/stats`, {
    headers: {
      Cookie: `session_token=${sessionToken}`
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  // Если не авторизован → на страницу входа
  if (!data || !data.success) {
    redirect('/auth/login')
  }

  const { specialist, stats, tasks } = data

  // Если профиль не заполнен → на онбординг
  if (!specialist.firstName || !specialist.lastName) {
    redirect('/specialist/onboarding')
  }

  const fullName = `${specialist.firstName} ${specialist.lastName}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация (простая) */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Aura</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden md:inline">
                {fullName}
              </span>
              {specialist.avatar && (
                <img
                  src={specialist.avatar}
                  alt={fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветствие */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            👋 Привет, {specialist.firstName}!
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Добро пожаловать в личный кабинет специалиста
          </p>
        </div>

        {/* Статистика */}
        <div className="mb-6">
          <DashboardStats
            profileViews={stats.profileViews}
            contactViews={stats.contactViews}
            consultationRequests={stats.consultationRequests}
          />
        </div>

        {/* Контент grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка (2/3 на десктопе) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Прогресс профиля */}
            <ProfileCompletionCard
              completionPercentage={stats.completionPercentage}
              tasks={tasks}
            />
          </div>

          {/* Правая колонка (1/3 на десктопе) */}
          <div className="space-y-6">
            {/* Быстрые действия */}
            <QuickActions slug={specialist.slug} />
          </div>
        </div>
      </div>
    </div>
  )
}

