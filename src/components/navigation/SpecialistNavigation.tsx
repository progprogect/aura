/**
 * Навигация на странице специалиста
 * Включает breadcrumbs (desktop) и FAB (mobile)
 */

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Breadcrumbs } from './Breadcrumbs'
import { FloatingBackButton } from './FloatingBackButton'
import { parseReturnUrl, getCatalogLabel } from '@/lib/navigation/utils'
import { BreadcrumbItem } from '@/lib/navigation/types'

interface SpecialistNavigationProps {
  /** Имя специалиста для breadcrumbs */
  specialistName: string
  
  /** Категория специалиста */
  category: string
}

/**
 * Внутренний компонент с useSearchParams
 */
function NavigationContent({
  specialistName,
  category,
}: SpecialistNavigationProps) {
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  // Парсим returnUrl для определения контекста
  const { hasContext, category: filterCategory } = parseReturnUrl(returnUrl)

  // Генерируем breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Главная', href: '/' },
    hasContext && returnUrl
      ? {
          // Из каталога - используем категорию из фильтра
          label: getCatalogLabel(filterCategory),
          href: returnUrl,
        }
      : {
          // Напрямую - используем категорию специалиста
          label: getCatalogLabel(category),
          href: '/catalog',
        },
    { label: specialistName, isActive: true },
  ]

  // Label для FAB
  const fabLabel = getCatalogLabel(filterCategory || category)

  return (
    <>
      {/* Desktop Breadcrumbs - всегда показываем */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Mobile FAB - только если есть returnUrl */}
      {returnUrl && <FloatingBackButton returnUrl={returnUrl} label={fabLabel} />}
    </>
  )
}

/**
 * Компонент навигации для страницы специалиста
 * Обёрнут в Suspense для useSearchParams
 * 
 * @example
 * <SpecialistNavigation 
 *   specialistName="Иван Петров"
 *   category="psychology"
 * />
 */
export function SpecialistNavigation(props: SpecialistNavigationProps) {
  return (
    <Suspense fallback={null}>
      <NavigationContent {...props} />
    </Suspense>
  )
}

