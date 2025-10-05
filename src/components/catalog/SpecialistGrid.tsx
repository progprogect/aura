'use client'

import { Specialist, PaginationInfo } from './CatalogContent'
import { SpecialistCard } from './SpecialistCard'

interface SpecialistGridProps {
  specialists: Specialist[]
  pagination: PaginationInfo | null
  onLoadMore: (page: number) => void
}

export function SpecialistGrid({ specialists, pagination, onLoadMore }: SpecialistGridProps) {
  const handleLoadMore = () => {
    if (pagination && pagination.hasNext) {
      onLoadMore(pagination.page + 1)
    }
  }
  
  if (specialists.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {specialists.map((specialist) => (
          <SpecialistCard key={specialist.id} specialist={specialist} />
        ))}
      </div>
      
      {/* Кнопка "Загрузить еще" */}
      {pagination && pagination.hasNext && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Загрузить еще
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
