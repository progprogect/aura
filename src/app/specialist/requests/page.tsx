/**
 * Страница заявок на консультацию
 * /specialist/requests
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { RequestsList } from '@/components/specialist/requests/RequestsList'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Мои заявки | Аура',
  description: 'Заявки на консультацию',
  robots: 'noindex, nofollow',
}

async function getRequests() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value

  if (!sessionToken) {
    return null
  }

  const authSession = await prisma.authSession.findFirst({
    where: {
      sessionToken,
      expiresAt: { gt: new Date() },
      isActive: true
    },
    include: {
      user: {
        include: {
          specialistProfile: {
            select: { id: true }
          }
        }
      }
    }
  })

  if (!authSession || !authSession.user.specialistProfile) {
    return null
  }

  // Получаем заявки
  const requests = await prisma.consultationRequest.findMany({
    where: {
      specialistProfileId: authSession.user.specialistProfile.id
    },
    include: {
      leadMagnet: {
        select: {
          id: true,
          title: true,
          emoji: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Статистика
  const newCount = requests.filter(r => r.status === 'new').length
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const totalThisWeek = requests.filter(r => r.createdAt >= weekAgo).length

  return {
    requests,
    stats: {
      newCount,
      totalThisWeek,
      total: requests.length
    }
  }
}

export default async function RequestsPage() {
  const data = await getRequests()

  if (!data) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/specialist/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Мои заявки
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Заявки на консультацию от клиентов
              </p>
            </div>
          </div>

          {/* Статистика */}
          <div className="flex gap-4 flex-wrap">
            <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Новые</p>
              <p className="text-2xl font-bold text-blue-900">{data.stats.newCount}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">За неделю</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalThisWeek}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
              <p className="text-xs text-gray-600 font-medium">Всего</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Список заявок */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <RequestsList requests={data.requests} />
      </div>
    </div>
  )
}

