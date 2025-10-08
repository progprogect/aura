/**
 * Условная навигация - скрывает стандартную навигацию на главной странице
 * Использует навигацию с поддержкой авторизации
 */

'use client'

import { usePathname } from 'next/navigation'
import { AuthAwareNavigation } from './AuthAwareNavigation'

export function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Скрываем стандартную навигацию на главной странице
  if (pathname === '/') {
    return null
  }
  
  return <AuthAwareNavigation />
}
