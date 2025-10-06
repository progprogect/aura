/**
 * Breadcrumbs навигация для desktop
 * Минимальный дизайн, только необходимое
 */

'use client'

import Link from 'next/link'
import { Icon } from '@/components/ui/icons/Icon'
import { ChevronRight } from '@/components/ui/icons/catalog-icons'
import { BreadcrumbItem } from '@/lib/navigation/types'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

/**
 * Компонент breadcrumbs навигации
 * Показывается только на desktop (скрыт на mobile)
 * 
 * Features:
 * - Schema.org разметка для SEO
 * - Accessibility support
 * - Минималистичный дизайн
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <>
      {/* Breadcrumbs навигация */}
      <nav
        aria-label="Breadcrumb"
        className="hidden md:block py-3 border-b border-gray-100"
      >
        <div className="container mx-auto px-4">
          <ol className="flex items-center text-sm space-x-2" role="list">
            {items.map((item, index) => (
              <li key={index} className="flex items-center" role="listitem">
                {/* Разделитель */}
                {index > 0 && (
                  <Icon
                    icon={ChevronRight}
                    size={14}
                    className="mx-2 text-gray-300"
                    aria-hidden
                  />
                )}

                {/* Элемент breadcrumb */}
                {item.isActive ? (
                  <span className="text-gray-900 font-medium">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* Schema.org разметка для SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.label,
              item: item.href || undefined,
            })),
          }),
        }}
      />
    </>
  )
}

