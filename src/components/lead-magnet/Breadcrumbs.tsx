/**
 * Breadcrumbs для навигации с лид-магнита обратно к профилю
 */

'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface BreadcrumbsProps {
  specialistSlug: string
  specialistName: string
  leadMagnetTitle: string
}

export function Breadcrumbs({ 
  specialistSlug, 
  specialistName, 
  leadMagnetTitle 
}: BreadcrumbsProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-2xl mx-auto">
        <Link 
          href={`/specialist/${specialistSlug}`}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="font-medium">{specialistName}</span>
        </Link>
        <div className="text-xs text-gray-500 mt-1 ml-5 truncate">
          {leadMagnetTitle}
        </div>
      </div>
    </div>
  )
}

