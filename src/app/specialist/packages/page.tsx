/**
 * Страница покупки пакетов для специалистов
 */

import { getCurrentUser } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import { PackagesList } from '@/components/specialist/packages/PackagesList'
import { CurrentLimits } from '@/components/specialist/packages/CurrentLimits'

export default async function PackagesPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  if (!user.specialistProfile) {
    redirect('/profile')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Пополнение лимитов
          </h1>
          <p className="text-lg text-gray-600">
            Купите баллы для просмотра контактов и получения заявок
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Текущие лимиты */}
          <div className="lg:col-span-1">
            <CurrentLimits specialistId={user.specialistProfile.id} />
          </div>

          {/* Пакеты */}
          <div className="lg:col-span-2">
            <PackagesList specialistId={user.specialistProfile.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
