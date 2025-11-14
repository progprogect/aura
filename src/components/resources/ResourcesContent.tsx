/**
 * Главный компонент библиотеки ресурсов
 */

'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { ResourcesSearchBar } from './ResourcesSearchBar'
import { ResourcesFilterButton } from './ResourcesFilterButton'
import { ResourcesFilterModal } from './ResourcesFilterModal'
import { ResourcesGrid } from './ResourcesGrid'
import { LoadingSpinner } from './LoadingSpinner'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { useResources } from '@/hooks/useResources'
import { useResourcesFilters } from '@/hooks/useResourcesFilters'
import { useScrollRestoration } from '@/hooks/useScrollRestoration'

function formatResourceCount(count: number): string {
  if (count === 0) return '0 ресурсов'
  if (count === 1) return '1 ресурс'
  if (count >= 2 && count <= 4) return `${count} ресурса`
  return `${count} ресурсов`
}

export function ResourcesContent() {
  const { toasts, addToast, removeToast } = useToast()
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentRoute = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
  
  const {
    filters,
    setters,
    updateFilters,
    resetFilters,
    activeFiltersCount,
  } = useResourcesFilters()

  const { resources, pagination, loading, error, loadMore } = useResources(filters)

  useScrollRestoration(currentRoute, !loading && resources.length > 0)

  // Обработка ошибок с useEffect, чтобы избежать повторных toast
  useEffect(() => {
    if (error && !loading) {
      addToast({
        type: 'error',
        title: 'Ошибка загрузки',
        description: error,
      })
    }
  }, [error, loading, addToast])

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <ResourcesSearchBar
        value={filters.search}
        onChange={setters.setSearch}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <ResourcesFilterButton
          activeFiltersCount={activeFiltersCount}
          onClick={() => setIsFilterModalOpen(true)}
        />

        <div className="text-sm sm:text-base text-gray-600 text-center sm:text-right" role="status" aria-live="polite">
          Найдено {formatResourceCount(pagination?.totalCount || 0)}
        </div>
      </div>

      {loading && resources.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <ResourcesGrid
          resources={resources}
          pagination={pagination}
          onLoadMore={loadMore}
          loading={loading}
        />
      )}

      <ResourcesFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={updateFilters}
        onReset={() => {
          resetFilters()
          setIsFilterModalOpen(false)
        }}
      />
    </>
  )
}

