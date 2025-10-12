/**
 * PreviewSkeleton - квадратный skeleton loader для превью лид-магнитов
 */

'use client'

import { cn } from '@/lib/utils'

interface PreviewSkeletonProps {
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export function PreviewSkeleton({ className, size = 'medium' }: PreviewSkeletonProps) {
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-full aspect-square max-w-md',
    large: 'w-full aspect-square'
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-lg bg-gray-200 animate-pulse',
        sizeClasses[size],
        className
      )}
    >
      {/* Анимированный градиент */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      
      {/* Центральная иконка */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-gray-300 rounded-full" />
      </div>
    </div>
  )
}

