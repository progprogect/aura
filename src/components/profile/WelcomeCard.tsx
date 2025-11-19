/**
 * Welcome Card - приветственная карточка для новых пользователей
 * Помогает понять "что дальше" после регистрации
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Gift, FileText, Edit, Package, X, BookOpen, Users } from 'lucide-react'

interface WelcomeAction {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  href: string
}

interface WelcomeCardProps {
  userId: string
  firstName: string
  hasSpecialistProfile: boolean
  specialistSlug?: string
  profileType?: 'specialist' | 'company'
}

export function WelcomeCard({
  userId,
  firstName,
  hasSpecialistProfile,
  specialistSlug,
  profileType = 'specialist',
}: WelcomeCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Проверяем localStorage при монтировании (только на клиенте)
    if (typeof window === 'undefined') return
    
    try {
      const dismissed = localStorage.getItem(`welcome_card_dismissed_${userId}`)
      if (!dismissed) {
        setIsVisible(true)
      }
    } catch (error) {
      // localStorage недоступен (например, в приватном режиме)
      console.warn('[WelcomeCard] localStorage недоступен:', error)
      setIsVisible(true) // Показываем карточку если localStorage недоступен
    }
  }, [userId])

  const handleDismiss = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`welcome_card_dismissed_${userId}`, 'true')
      }
    } catch (error) {
      console.warn('[WelcomeCard] Не удалось сохранить в localStorage:', error)
    }
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  // Определяем действия в зависимости от типа пользователя
  const actions: WelcomeAction[] = hasSpecialistProfile
    ? [
        {
          icon: Edit,
          label: 'Заполнить профиль',
          description: 'Добавьте информацию о себе',
          href: specialistSlug
            ? `/specialist/${specialistSlug}?edit=true`
            : '/profile',
        },
        {
          icon: Gift,
          label: 'Создать полезные материалы',
          description: 'Привлеките клиентов бесплатными материалами',
          href: '/profile?section=lead-magnets',
        },
        {
          icon: Package,
          label: 'Добавить услуги',
          description: 'Начните получать заказы',
          href: '/profile?section=services',
        },
        {
          icon: BookOpen,
          label: 'Найти полезные материалы',
          description: 'Библиотека ресурсов от других экспертов',
          href: '/library',
        },
        {
          icon: Users,
          label: 'Найти клиентов',
          description: 'Просмотрите открытые заявки и откликнитесь',
          href: '/find-work',
        },
      ]
    : [
        {
          icon: Search,
          label: 'Найти специалиста',
          description: 'Используйте каталог или AI-чат',
          href: '/catalog',
        },
        {
          icon: BookOpen,
          label: 'Найти полезные материалы',
          description: 'Библиотека ресурсов от экспертов',
          href: '/library',
        },
        {
          icon: FileText,
          label: 'Опубликовать задачу',
          description: 'Опишите задачу и получите отклики специалистов',
          href: '/requests/create',
        },
      ]

  const isCompany = profileType === 'company'
  const displayName = firstName || 'Пользователь'

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 shadow-md">
      <CardHeader className="relative pb-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 pr-8">
          👋 Добро пожаловать, {displayName}!
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-6 w-6 text-gray-400 hover:text-gray-600"
          onClick={handleDismiss}
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </Button>
        <p className="text-sm text-gray-600 mt-1">
          {hasSpecialistProfile
            ? isCompany
              ? 'Начните получать клиентов для вашей компании'
              : 'Начните получать клиентов'
            : 'Что вы можете сделать на платформе'}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 px-4 flex items-start gap-3 text-left hover:bg-white/90 transition-all border-blue-200 bg-white/50 hover:border-blue-300 hover:shadow-sm"
                >
                  <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 mb-1">
                      {action.label}
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">{action.description}</div>
                  </div>
                  <div className="text-gray-400 flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

