import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'outline'
}

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles (Instagram-inspired)
          'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          'cursor-pointer select-none',
          // Variants
          {
            // Default: светло-серый фон
            'bg-gray-100 text-gray-700 hover:bg-gray-150':
              variant === 'default',
            // Primary: фиолетовый
            'bg-primary-100 text-primary-700 hover:bg-primary-150':
              variant === 'primary',
            // Outline: с границей
            'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50':
              variant === 'outline',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Tag.displayName = 'Tag'

export { Tag }



