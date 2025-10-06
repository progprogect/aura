/**
 * Компонент для красивых SVG иконок преимуществ
 */

import React from 'react'
import Image from 'next/image'

interface AdvantageIconProps {
  advantage: string
  size?: number
  className?: string
}

export function AdvantageIcon({ advantage, size = 32, className = '' }: AdvantageIconProps) {
  const iconMap: Record<string, string> = {
    target: '/icons/target.svg',
    bot: '/icons/bot.svg',
    zap: '/icons/zap.svg',
    shield: '/icons/shield.svg',
  }

  const iconPath = iconMap[advantage] || '/icons/question-mark-circle.svg'

  return (
    <Image
      src={iconPath}
      alt={`${advantage} иконка`}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      priority={advantage === 'target'} // Приоритет для первой иконки
    />
  )
}
