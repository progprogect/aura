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
      label: 'Мой профиль',
      description: 'Посмотреть и редактировать',
      variant: 'default' as const,
      isMain: true
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
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon
            const isMain = (action as any).isMain
            
            return (
              <Button
                key={action.label}
                asChild={!action.disabled}
                variant={action.variant}
                className={`
                  h-auto py-4 px-4 flex items-center justify-start gap-3 text-left w-full
                  ${isMain ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl' : ''}
                  ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
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
                    <div className={`
                      p-2 rounded-lg
                      ${isMain 
                        ? 'bg-white/20' 
                        : action.variant === 'default' 
                          ? 'bg-white/20' 
                          : 'bg-blue-50'
                      }
                    `}>
                      <Icon className={`
                        w-5 h-5
                        ${isMain 
                          ? 'text-white' 
                          : action.variant === 'default' 
                            ? 'text-white' 
                            : 'text-blue-600'
                        }
                      `} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`
                        font-medium text-sm
                        ${isMain ? 'text-white' : ''}
                      `}>
                        {action.label}
                      </div>
                      <div className={`
                        text-xs
                        ${isMain ? 'text-white/80' : 'opacity-80'}
                      `}>
                        {action.description}
                      </div>
                    </div>
                    {isMain && (
                      <div className="text-white/60">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
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

