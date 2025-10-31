/**
 * Условная навигация - скрывает стандартную навигацию на главной странице
 * Использует унифицированную навигацию с поддержкой авторизации
 */

'use client'

import { usePathname } from 'next/navigation'
import { UnifiedNavigation } from './UnifiedNavigation'

export function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Скрываем стандартную навигацию на главной странице (там используется UnifiedNavigation variant="hero")
  if (pathname === '/') {
    return null
  }
  
  return <UnifiedNavigation variant="standard" />
}
