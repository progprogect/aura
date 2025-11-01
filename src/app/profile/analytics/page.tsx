/**
 * Страница аналитики для специалиста
 * /profile/analytics
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { AnalyticsDashboard } from '@/components/specialist/analytics/AnalyticsDashboard'

async function checkSpecialistAccess() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value

  if (!sessionToken) {
    return null
  }

  const session = await prisma.authSession.findFirst({
    where: {
      sessionToken,
      expiresAt: { gt: new Date() },
      isActive: true
    },
    include: {
      user: {
        include: {
          specialistProfile: true
        }
      }
    }
  })

  if (!session || !session.user.specialistProfile) {
    return null
  }

  return session.user.specialistProfile
}

export default async function AnalyticsPage() {
  const specialistProfile = await checkSpecialistAccess()

  if (!specialistProfile) {
    redirect('/profile')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
              📊 Аналитика
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Статистика по вашему профилю и активности пользователей
          </p>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}

