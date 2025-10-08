/**
 * Быстрые действия для дашборда
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Edit, BarChart3, MessageSquare } from 'lucide-react'

interface QuickActionsProps {
  slug: string
}

export function QuickActions({ slug }: QuickActionsProps) {
  const actions = [
    {
      href: `/specialist/${slug}`,
      icon: Eye,
      label: 'Посмотреть профиль',
      description: 'Как клиент',
      variant: 'default' as const
    },
    {
      href: `/specialist/${slug}?edit=true`,
      icon: Edit,
      label: 'Редактировать',
      description: 'Изменить данные',
      variant: 'outline' as const
    },
    {
      href: '#',
      icon: BarChart3,
      label: 'Аналитика',
      description: 'Скоро',
      variant: 'outline' as const,
      disabled: true
    },
    {
      href: '#',
      icon: MessageSquare,
      label: 'Заявки',
      description: 'Скоро',
      variant: 'outline' as const,
      disabled: true
    }
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">🔧 Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            
            return (
              <Button
                key={action.label}
                asChild={!action.disabled}
                variant={action.variant}
                className="h-auto py-4 px-4 flex items-center justify-start gap-3 text-left"
                disabled={action.disabled}
              >
                {action.disabled ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">
                        {action.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {action.description}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href={action.href} className="flex items-center gap-3 w-full">
                    <div className={`p-2 rounded-lg ${action.variant === 'default' ? 'bg-white/20' : 'bg-blue-50'}`}>
                      <Icon className={`w-5 h-5 ${action.variant === 'default' ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {action.label}
                      </div>
                      <div className="text-xs opacity-80">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                )}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

