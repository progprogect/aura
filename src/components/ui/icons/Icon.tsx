/**
 * Базовый компонент иконки
 * Обертка над lucide-react для единообразного использования иконок
 */

import { LucideIcon, LucideProps } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface IconProps extends Omit<LucideProps, 'ref'> {
  /** Компонент иконки из lucide-react */
  icon: LucideIcon
  /** Размер иконки (по умолчанию 20) */
  size?: number
  /** Дополнительные CSS классы */
  className?: string
  /** ARIA label для accessibility */
  'aria-label'?: string
  /** ARIA hidden (для декоративных иконок) */
  'aria-hidden'?: boolean
}

/**
 * Базовый компонент иконки с поддержкой accessibility
 * 
 * @example
 * <Icon icon={Search} size={24} aria-label="Поиск" />
 * <Icon icon={X} size={16} aria-hidden /> // Декоративная иконка
 */
export function Icon({
  icon: LucideIconComponent,
  size = 20,
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = !ariaLabel, // Если нет label - скрываем от screen readers
  ...props
}: IconProps) {
  return (
    <LucideIconComponent
      size={size}
      className={cn('flex-shrink-0', className)}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    />
  )
}

/**
 * Компонент иконки для кнопок (со стандартными размерами)
 */
export function ButtonIcon({
  icon,
  className,
  ...props
}: Omit<IconProps, 'size'>) {
  return (
    <Icon
      icon={icon}
      size={16}
      className={cn('mr-2', className)}
      aria-hidden // Иконки в кнопках декоративные, текст кнопки описывает действие
      {...props}
    />
  )
}

/**
 * Компонент иконки для списков и карточек
 */
export function ListIcon({
  icon,
  className,
  ...props
}: Omit<IconProps, 'size'>) {
  return (
    <Icon
      icon={icon}
      size={14}
      className={cn('text-gray-500', className)}
      {...props}
    />
  )
}

