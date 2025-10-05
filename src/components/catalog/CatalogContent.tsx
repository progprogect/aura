/**
 * Главный компонент каталога специалистов
 * Версия 3.0 - полностью рефакторенная
 */

'use client'

import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { SearchBar } from './SearchBar'
import { FilterButton } from './FilterButton'
import { SortButton } from './SortButton'
import { FilterModal } from './FilterModal'
import { SpecialistGrid } from './SpecialistGrid'
import { LoadingSpinner } from './LoadingSpinner'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { useSpecialists } from '@/hooks/useSpecialists'
import { useCatalogFilters } from '@/hooks/useCatalogFilters'
import { useScrollRestoration } from '@/hooks/useScrollRestoration'
import { formatSpecialistCount } from '@/lib/utils/pluralize'

/**
 * Компонент каталога специалистов
 * 
 * Features:
 * - Централизованное управление фильтрами
 * - Автоматическая синхронизация с URL
 * - Оптимизированный рендеринг
 * - Accessibility support
 */
export function CatalogContent() {
  // Toast уведомления
  const { toasts, addToast, removeToast } = useToast()
  
  // Состояние модального окна фильтров
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  
  // Текущий route для scroll restoration
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentRoute = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
  
  // Централизованное управление фильтрами
  const {
    filters,
    setters,
    updateFilters,
    resetFilters,
    activeFiltersCount,
  } = useCatalogFilters()

  // API запросы с кэшированием
  const { specialists, pagination, loading, error, loadMore } = useSpecialists(filters)

  // Восстановление позиции скролла при возврате
  useScrollRestoration(currentRoute, !loading && specialists.length > 0)

  // Обработка ошибок
  if (error && !loading) {
    addToast({
      type: 'error',
      title: 'Ошибка загрузки',
      description: error,
    })
  }

  return (
    <>
      {/* Toast уведомления */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Поисковая строка */}
      <SearchBar
        value={filters.search}
        onChange={setters.setSearch}
      />

      {/* Панель фильтров - Desktop */}
      <div className="hidden md:flex md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-4">
          <FilterButton
            activeFiltersCount={activeFiltersCount}
            onClick={() => setIsFilterModalOpen(true)}
          />
          <SortButton value={filters.sortBy} onChange={setters.setSortBy} />
        </div>

        {/* Счётчик результатов */}
        <div className="text-sm text-gray-600" role="status" aria-live="polite">
          Найдено {formatSpecialistCount(pagination?.totalCount || 0)}
        </div>
      </div>

      {/* Панель фильтров - Mobile */}
      <div className="md:hidden mb-6 space-y-3">
        {/* Счётчик сверху */}
        <div
          className="text-sm text-gray-600 font-medium"
          role="status"
          aria-live="polite"
        >
          Найдено {formatSpecialistCount(pagination?.totalCount || 0)}
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <FilterButton
            activeFiltersCount={activeFiltersCount}
            onClick={() => setIsFilterModalOpen(true)}
            compact
          />
          <SortButton value={filters.sortBy} onChange={setters.setSortBy} compact />
        </div>
      </div>

      {/* Сетка специалистов */}
      {loading && specialists.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <SpecialistGrid
          specialists={specialists}
          pagination={pagination}
          onLoadMore={loadMore}
          loading={loading}
        />
      )}

      {/* Модальное окно фильтров */}
      <FilterModal
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

