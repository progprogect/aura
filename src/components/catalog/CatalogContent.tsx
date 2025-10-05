/**
 * Главный компонент каталога специалистов
 * Версия 3.0 - полностью рефакторенная
 */

'use client'

import { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { SearchBar } from './SearchBar'
import { FilterButton } from './FilterButton'
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

      {/* Панель фильтров */}
      <div className="flex items-center justify-between mb-6">
        <FilterButton
          activeFiltersCount={activeFiltersCount}
          onClick={() => setIsFilterModalOpen(true)}
        />

        {/* Счётчик результатов */}
        <div className="text-sm text-gray-600" role="status" aria-live="polite">
          Найдено {formatSpecialistCount(pagination?.totalCount || 0)}
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

