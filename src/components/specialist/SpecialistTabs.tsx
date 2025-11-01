'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface Tab {
  id: string
  label: string
  icon?: string // Строковый идентификатор иконки
}

// Маппинг иконок для удобства
export const ICON_MAP = {
  'user': '/icons/user.svg',
  'sparkles': '/icons/sparkles.svg',
  'video-camera': '/icons/video-camera.svg',
  'academic-cap': '/icons/academic-cap.svg',
  'photo': '/icons/photo.svg',
  'question-mark-circle': '/icons/question-mark-circle.svg',
  'paper-airplane': '/icons/paper-airplane.svg',
  'currency-dollar': '/icons/currency-dollar.svg',
  'clock': '/icons/clock.svg',
  'shopping-cart': '/icons/shopping-cart.svg',
  'gift': '/icons/gift.svg',
  'star': '/icons/star.svg',
} as const

export type IconName = keyof typeof ICON_MAP

export interface SpecialistTabsProps {
  tabs: Tab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
}

export function SpecialistTabs({ tabs, activeTab, onTabChange }: SpecialistTabsProps) {
  const [isSticky, setIsSticky] = React.useState(false)
  const tabsRef = React.useRef<HTMLDivElement>(null)

  // Отслеживание прокрутки для sticky эффекта
  React.useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current) {
        const rect = tabsRef.current.getBoundingClientRect()
        setIsSticky(rect.top <= 0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Скролл к секции
  const scrollToSection = (tabId: string) => {
    const element = document.getElementById(tabId)
    if (element) {
      const offset = 80 // Высота sticky табов
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
    onTabChange?.(tabId)
  }

  return (
    <div
      ref={tabsRef}
      className={cn(
        'sticky top-0 z-40 border-b bg-white transition-shadow md:top-0',
        isSticky ? 'shadow-sm' : 'border-gray-200'
      )}
    >
      <div className="container mx-auto max-w-5xl px-4">
        <div className="scrollbar-hide flex space-x-2 sm:space-x-4 md:space-x-6 overflow-x-auto pb-1">
          {tabs.map(tab => {
            const iconPath = tab.icon ? ICON_MAP[tab.icon as IconName] || tab.icon : null
            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={cn(
                  'relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap py-3 sm:py-4 px-1 sm:px-2 text-xs sm:text-sm font-medium transition-colors',
                  'hover:text-gray-900 touch-manipulation',
                  activeTab === tab.id
                    ? 'text-gray-900'
                    : 'text-gray-500'
                )}
              >
                {iconPath && (
                  <Image 
                    src={iconPath} 
                    alt="" 
                    width={16}
                    height={16}
                    className="h-4 w-4"
                    style={{ filter: activeTab === tab.id ? 'none' : 'opacity(0.6)' }}
                  />
                )}
                <span>{tab.label}</span>

                {/* Активная линия снизу */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Хук для отслеживания активного таба при скролле
export function useActiveTab(tabs: Tab[]) {
  const [activeTab, setActiveTab] = React.useState<string>(tabs[0]?.id || '')

  React.useEffect(() => {
    const handleScroll = () => {
      // Найти активную секцию по позиции скролла
      const scrollPosition = window.scrollY + 100

      for (const tab of tabs) {
        const element = document.getElementById(tab.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveTab(tab.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Инициализация

    return () => window.removeEventListener('scroll', handleScroll)
  }, [tabs])

  return activeTab
}
