/**
 * Статистика для дашборда
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Eye, MessageCircle, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  profileViews: number
  contactViews: number
  consultationRequests: number
}

export function DashboardStats({ profileViews, contactViews, consultationRequests }: DashboardStatsProps) {
  const stats = [
    {
      icon: Eye,
      label: 'Просмотров профиля',
      value: profileViews,
      sublabel: 'за все время',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: MessageCircle,
      label: 'Просмотров контактов',
      value: contactViews,
      sublabel: 'за все время',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: TrendingUp,
      label: 'Новых заявок',
      value: consultationRequests,
      sublabel: 'за неделю',
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        
        return (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.sublabel}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

