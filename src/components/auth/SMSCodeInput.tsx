/**
 * Компонент для ввода SMS кода
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SMSCodeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  onComplete?: () => void
  length?: number
}

export const SMSCodeInput = React.forwardRef<HTMLInputElement, SMSCodeInputProps>(
  ({ className, value = '', onChange, onComplete, length = 4, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/\D/g, '').slice(0, length)
      onChange?.(newValue)
      
      // Вызываем onComplete если код полностью введен
      if (newValue.length === length && onComplete) {
        onComplete()
      }
    }

    return (
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={length}
        value={value}
        onChange={handleChange}
        className={cn(
          'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg font-semibold tracking-widest ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
SMSCodeInput.displayName = 'SMSCodeInput'
