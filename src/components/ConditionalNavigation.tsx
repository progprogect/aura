/**
 * Условная навигация - скрывает стандартную навигацию на главной странице
 */

'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './Navigation'

export function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Скрываем стандартную навигацию на главной странице
  if (pathname === '/') {
    return null
  }
  
  return <Navigation />
}
