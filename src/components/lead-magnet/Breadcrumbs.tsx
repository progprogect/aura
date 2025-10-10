/**
 * Breadcrumbs для детальной страницы лид-магнита
 * Консистентность с остальным приложением
 */

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { BreadcrumbItem } from '@/lib/navigation/types'

interface LeadMagnetBreadcrumbsProps {
  specialistSlug: string
  specialistName: string
  leadMagnetTitle: string
  category?: string
}

export function LeadMagnetBreadcrumbs({ 
  specialistSlug, 
  specialistName,
  leadMagnetTitle,
  category
}: LeadMagnetBreadcrumbsProps) {
  // Генерируем breadcrumbs в стиле приложения
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог специалистов', href: '/catalog' },
    { label: specialistName, href: `/specialist/${specialistSlug}` },
    { label: leadMagnetTitle, isActive: true },
  ]

  return <Breadcrumbs items={breadcrumbs} />
}

