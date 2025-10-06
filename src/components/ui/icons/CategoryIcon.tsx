/**
 * Компонент для красивых SVG иконок категорий
 */

import React from 'react'
import Image from 'next/image'

interface CategoryIconProps {
  category: string
  size?: number
  className?: string
}

export function CategoryIcon({ category, size = 24, className = '' }: CategoryIconProps) {
  const iconMap: Record<string, string> = {
    psychology: '/icons/brain.svg',
    fitness: '/icons/dumbbell.svg',
    nutrition: '/icons/apple.svg',
    massage: '/icons/heart.svg',
    coaching: '/icons/users.svg',
    medicine: '/icons/stethoscope.svg',
  }

  const iconPath = iconMap[category] || '/icons/question-mark-circle.svg'

  return (
    <Image
      src={iconPath}
      alt={`${category} иконка`}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      priority={category === 'psychology'} // Приоритет для первой иконки
    />
  )
}
