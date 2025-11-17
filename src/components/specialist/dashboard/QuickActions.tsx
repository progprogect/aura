/**
 * Быстрые действия для дашборда
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, BarChart3, MessageSquare, Inbox, Stethoscope, Package, ShoppingCart, FileText, Search, BookOpen } from 'lucide-react'
import { useOnboarding } from './OnboardingContext'

export interface QuickActionsProps {
  slug?: string
  newRequestsCount?: number
  newOrdersCount?: number
  isSpecialist?: boolean
  purchasesStats?: {
    total: number
    paid: number
    completed: number
    cancelled: number
    disputed: number
  }
  onOpenOnboarding?: () => void
}

export function QuickActions({ slug, newRequestsCount = 0, newOrdersCount = 0, isSpecialist = true, purchasesStats, onOpenOnboarding: onOpenOnboardingProp }: QuickActionsProps) {
  // Используем контекст напрямую с fallback на проп
  const onboardingContext = useOnboarding()
  const onOpenOnboarding = onboardingContext?.openOnboarding || onOpenOnboardingProp
  const specialistActions = [
    {
      href: '/specialist/orders',
      icon: Package,
      label: 'Мои заказы',
      description: newOrdersCount > 0 ? `${newOrdersCount} новых` : 'Заказы услуг',
      variant: 'outline' as const,
      badge: newOrdersCount,
      disabled: false,
      color: 'green'
    },
    {
      href: '/specialist/requests',
      icon: Inbox,
      label: 'Бесплатные заявки',
      description: newRequestsCount > 0 ? `${newRequestsCount} новых` : 'От лид-магнитов',
      variant: 'outline' as const,
      badge: newRequestsCount,
      disabled: false
    },
    {
      href: '/find-work',
      icon: Search,
      label: 'Найти клиента',
      description: 'Просмотреть все заявки',
      variant: 'outline' as const,
      disabled: false
    },
    {
      href: '/specialist/proposals',
      icon: FileText,
      label: 'Мои отклики',
      description: 'Управление откликами',
      variant: 'outline' as const,
      disabled: false
    },
    {
      href: '/purchases',
      icon: ShoppingCart,
      label: 'Мои покупки',
      description: purchasesStats && purchasesStats.total > 0 
        ? `${purchasesStats.paid + purchasesStats.completed} заказов` 
        : 'Покупки как клиент',
      variant: 'outline' as const,
      badge: purchasesStats ? purchasesStats.paid + purchasesStats.completed : 0,
      disabled: false
    },
    {
      href: '/specialist/packages',
      icon: Package,
      label: 'Купить баллы',
      description: 'Пополнить лимиты',
      variant: 'outline' as const,
      disabled: false
    },
    {
      href: '/profile/analytics',
      icon: BarChart3,
      label: 'Аналитика',
      description: 'Статистика и метрики',
      variant: 'outline' as const,
      disabled: false
    },
    ...(onOpenOnboarding ? [{
      href: '#',
      icon: BookOpen,
      label: 'Как работает платформа',
      description: 'Просмотреть онбординг',
      variant: 'outline' as const,
      disabled: false,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        onOpenOnboarding()
      }
    }] : [])
  ]

  const userActions = [
    {
      href: '/purchases',
      icon: ShoppingCart,
      label: 'Мои покупки',
      description: purchasesStats && purchasesStats.total > 0 
        ? `${purchasesStats.paid + purchasesStats.completed} заказов` 
        : 'История заказов и статусы',
      variant: 'default' as const,
      isMain: true,
      disabled: false,
      badge: purchasesStats ? purchasesStats.paid + purchasesStats.completed : 0
    },
    {
      href: '/requests',
      icon: FileText,
      label: 'Мои заявки',
      description: 'Созданные заявки',
      variant: 'outline' as const,
      isMain: false,
      disabled: false
    },
    {
      href: '/auth/register',
      icon: Stethoscope,
      label: 'Зарегистрироваться',
      description: 'Создать профиль специалиста или компании',
      variant: 'outline' as const,
      isMain: false,
      disabled: false
    }
  ]

  const actions = isSpecialist ? specialistActions : userActions

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
                  h-auto py-3 px-3 flex items-center justify-start gap-2.5 text-left w-full
                  ${isMain ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl' : ''}
                  ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={action.disabled}
              >
                {action.disabled ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-1.5 rounded-lg bg-gray-100">
                      <Icon className="w-4 h-4 text-gray-400" />
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
                ) : (action as any).onClick ? (
                  <button
                    onClick={(action as any).onClick}
                    className="flex items-center gap-3 w-full text-left"
                  >
                    <div className={`
                      p-1.5 rounded-lg relative
                      ${isMain 
                        ? 'bg-white/20' 
                        : action.variant === 'default' 
                          ? 'bg-white/20' 
                          : 'bg-blue-50'
                      }
                    `}>
                      <Icon className={`
                        w-4 h-4
                        ${isMain 
                          ? 'text-white' 
                          : action.variant === 'default' 
                            ? 'text-white' 
                            : 'text-blue-600'
                        }
                      `} />
                      {/* Бейдж для заявок */}
                      {(action as any).badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {(action as any).badge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`
                        font-medium text-sm flex items-center gap-2
                        ${isMain ? 'text-white' : ''}
                      `}>
                        {action.label}
                        {/* Текстовый бейдж для заявок */}
                        {(action as any).badge > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {(action as any).badge}
                          </Badge>
                        )}
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
                  </button>
                ) : (
                  <Link href={action.href} className="flex items-center gap-3 w-full">
                    <div className={`
                      p-1.5 rounded-lg relative
                      ${isMain 
                        ? 'bg-white/20' 
                        : action.variant === 'default' 
                          ? 'bg-white/20' 
                          : 'bg-blue-50'
                      }
                    `}>
                      <Icon className={`
                        w-4 h-4
                        ${isMain 
                          ? 'text-white' 
                          : action.variant === 'default' 
                            ? 'text-white' 
                            : 'text-blue-600'
                        }
                      `} />
                      {/* Бейдж для заявок */}
                      {(action as any).badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {(action as any).badge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`
                        font-medium text-sm flex items-center gap-2
                        ${isMain ? 'text-white' : ''}
                      `}>
                        {action.label}
                        {/* Текстовый бейдж для заявок */}
                        {(action as any).badge > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {(action as any).badge}
                          </Badge>
                        )}
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

