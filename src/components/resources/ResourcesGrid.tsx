/**
 * Сетка карточек ресурсов с пагинацией
 */

'use client'

import { ResourceViewModel, PaginationInfo } from '@/lib/resources/types'
import { ResourceCard } from './ResourceCard'
import { Icon } from '@/components/ui/icons/Icon'
import { ChevronDown, Loader2 } from '@/components/ui/icons/catalog-icons'
import { BookOpen } from 'lucide-react'
import { MESSAGES } from '@/lib/resources/constants'

interface ResourcesGridProps {
  resources: ResourceViewModel[]
  pagination: PaginationInfo | null
  onLoadMore: () => void
  loading?: boolean
}

export function ResourcesGrid({
  resources,
  pagination,
  onLoadMore,
  loading = false,
}: ResourcesGridProps) {
  // Empty state
  if (resources.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4 flex items-center justify-center">
          <Icon icon={BookOpen} size={96} className="text-gray-300" aria-hidden />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {MESSAGES.NO_RESULTS}
        </h3>
        <p className="text-gray-500">
          {MESSAGES.NO_RESULTS_HINT}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Сетка карточек */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-8"
        role="list"
        aria-label="Список ресурсов"
      >
        {resources.map((resource, index) => (
          <div key={resource.id} role="listitem">
            <ResourceCard resource={resource} index={index} />
          </div>
        ))}
      </div>

      {/* Кнопка "Загрузить еще" */}
      {pagination && pagination.hasNext && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Загрузить еще ресурсов, страница ${pagination.page + 1} из ${pagination.totalPages}`}
          >
            {loading ? (
              <>
                <Icon
                  icon={Loader2}
                  size={16}
                  className="mr-2 animate-spin"
                  aria-hidden
                />
                {MESSAGES.LOADING}
              </>
            ) : (
              <>
                Загрузить еще
                <Icon
                  icon={ChevronDown}
                  size={16}
                  className="ml-2"
                  aria-hidden
                />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

