/**
 * Навигация на странице каталога
 * Только breadcrumbs (без FAB, так как не нужен возврат)
 */

'use client'

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { BreadcrumbItem } from '@/lib/navigation/types'

/**
 * Компонент навигации для страницы каталога
 * Статичные breadcrumbs: Главная → Каталог специалистов
 */
export function CatalogNavigation() {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог специалистов', isActive: true },
  ]

  return <Breadcrumbs items={breadcrumbs} />
}

