/**
 * Сетка карточек специалистов с пагинацией
 * Версия 2.0 с улучшениями:
 * - Lucide-react иконки
 * - Улучшенная accessibility
 * - Loading состояние для Load More
 */

'use client'

import { SpecialistViewModel, PaginationInfo } from '@/lib/catalog/types'
import { SpecialistCard } from './SpecialistCard'
import { Icon } from '@/components/ui/icons/Icon'
import { Users, ChevronDown, Loader2 } from '@/components/ui/icons/catalog-icons'

interface SpecialistGridProps {
  specialists: SpecialistViewModel[]
  pagination: PaginationInfo | null
  onLoadMore: () => void
  loading?: boolean
}

export function SpecialistGrid({
  specialists,
  pagination,
  onLoadMore,
  loading = false,
}: SpecialistGridProps) {
  // Empty state
  if (specialists.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4 flex items-center justify-center">
          <Icon icon={Users} size={96} className="text-gray-300" aria-hidden />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Специалисты не найдены
        </h3>
        <p className="text-gray-500">
          Попробуйте изменить параметры поиска или фильтры
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Сетка карточек */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8"
        role="list"
        aria-label="Список специалистов"
      >
        {specialists.map((specialist) => (
          <div key={specialist.id} role="listitem">
            <SpecialistCard specialist={specialist} />
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
            aria-label={`Загрузить еще специалистов, страница ${pagination.page + 1} из ${pagination.totalPages}`}
          >
            {loading ? (
              <>
                <Icon
                  icon={Loader2}
                  size={16}
                  className="mr-2 animate-spin"
                  aria-hidden
                />
                Загрузка...
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

      {/* Информация о пагинации (для screen readers) */}
      {pagination && (
        <div className="sr-only" role="status" aria-live="polite">
          Показано {specialists.length} из {pagination.totalCount} специалистов.
          Страница {pagination.page} из {pagination.totalPages}.
        </div>
      )}
    </div>
  )
}
