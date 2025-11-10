/**
 * Карточки статистики для админ-панели
 */

import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  UserCheck,
  ShoppingCart,
  Coins,
  Eye,
  MessageCircle,
  Star,
  TrendingUp,
  XCircle,
  CheckCircle,
} from 'lucide-react'

interface AdminStatsCardsProps {
  stats: {
    users: {
      total: number
      blocked: number
      active: number
      new: number
    }
    specialists: {
      total: number
      verified: number
      blocked: number
      active: number
      new: number
    }
    orders: {
      total: number
      active: number
      completed: number
      cancelled: number
      new: number
      conversionRate: number
    }
    points: {
      totalBalance: number
      totalBonusBalance: number
      granted: number
      spent: number
    }
    activity: {
      profileViews: number
      contactViews: number
      consultationRequests: number
      totalReviews: number
      newReviews: number
    }
  }
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    {
      title: 'Пользователи',
      value: stats.users.total,
      change: stats.users.new > 0 ? `+${stats.users.new}` : null,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      subtitle: `${stats.users.active} активных`,
    },
    {
      title: 'Специалисты',
      value: stats.specialists.total,
      change: stats.specialists.new > 0 ? `+${stats.specialists.new}` : null,
      icon: UserCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      subtitle: `${stats.specialists.verified} верифицировано`,
    },
    {
      title: 'Заказы',
      value: stats.orders.total,
      change: stats.orders.new > 0 ? `+${stats.orders.new}` : null,
      icon: ShoppingCart,
      color: 'text-green-600',
      bg: 'bg-green-50',
      subtitle: `${stats.orders.active} активных`,
    },
    {
      title: 'Баллы в системе',
      value: Math.round(stats.points.totalBalance + stats.points.totalBonusBalance).toLocaleString(),
      change: null,
      icon: Coins,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      subtitle: `${Math.round(stats.points.totalBonusBalance).toLocaleString()} бонусных`,
    },
    {
      title: 'Просмотры профилей',
      value: stats.activity.profileViews.toLocaleString(),
      change: null,
      icon: Eye,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      subtitle: `${stats.activity.contactViews.toLocaleString()} просмотров контактов`,
    },
    {
      title: 'Заявки',
      value: stats.activity.consultationRequests.toLocaleString(),
      change: null,
      icon: MessageCircle,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      subtitle: `${stats.activity.totalReviews} отзывов`,
    },
    {
      title: 'Завершено заказов',
      value: stats.orders.completed,
      change: null,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      subtitle: `${stats.orders.conversionRate.toFixed(1)}% конверсия`,
    },
    {
      title: 'Заблокировано',
      value: stats.users.blocked + stats.specialists.blocked,
      change: null,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      subtitle: `${stats.users.blocked} пользователей, ${stats.specialists.blocked} специалистов`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                    {card.change && (
                      <span className="text-xs font-medium text-green-600">
                        {card.change}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

