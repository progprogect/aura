/**
 * Универсальная обертка для секций профиля специалиста
 * Используется для единообразного отображения заголовков
 */

import { ReactNode } from 'react'

interface SectionProps {
  title: string
  icon: string
  iconBgColor?: string
  iconTextColor?: string
  children: ReactNode
  className?: string
}

export function Section({
  title,
  icon,
  iconBgColor = 'bg-green-100',
  iconTextColor = 'text-green-600',
  children,
  className = '',
}: SectionProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className={`w-8 h-8 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <span className={`${iconTextColor} text-sm`}>{icon}</span>
        </span>
        <span className="text-base sm:text-xl">{title}</span>
      </h2>
      {children}
    </div>
  )
}
