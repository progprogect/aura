/**
 * Страница заказов услуг для специалиста
 */

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { OrdersList } from '@/components/specialist/orders/OrdersList'

export const metadata = {
  title: 'Мои заказы - Аура',
  robots: 'noindex, nofollow',
}

async function getOrders() {
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

  // Получаем заказы
  const orders = await prisma.order.findMany({
    where: {
      specialistProfileId: authSession.user.specialistProfile.id
    },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          emoji: true,
          price: true,
          currency: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Статистика
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const totalThisWeek = orders.filter(o => o.createdAt >= weekAgo).length

  return {
    orders,
    stats: {
      pendingCount,
      inProgressCount,
      totalThisWeek,
      total: orders.length
    }
  }
}

export default async function OrdersPage() {
  const data = await getOrders()

  if (!data) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💼 Мои заказы
          </h1>
          <p className="text-gray-600">
            Управляйте заказами ваших услуг
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Ожидают</p>
            <p className="text-3xl font-bold text-yellow-600">{data.stats.pendingCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">В работе</p>
            <p className="text-3xl font-bold text-blue-600">{data.stats.inProgressCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">За неделю</p>
            <p className="text-3xl font-bold text-green-600">{data.stats.totalThisWeek}</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Все заказы ({data.stats.total})
          </h2>
          <OrdersList orders={data.orders as any} />
        </div>
      </div>
    </div>
  )
}

