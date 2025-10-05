'use client'

import { useState, useMemo } from 'react'
import { SearchBar } from './SearchBar'
import { FilterButton } from './FilterButton'
import { FilterModal } from './FilterModal'
import { SpecialistGrid } from './SpecialistGrid'
import { LoadingSpinner } from './LoadingSpinner'
import { useToast, ToastContainer } from '@/components/ui/toast'
import { useSpecialists } from '@/hooks/useSpecialists'
import { useURLString, useURLBoolean, useURLArray } from '@/hooks/useURLState'

interface FilterState {
  category: string
  experience: string
  format: string[]
  verified: boolean
  sortBy: string
  search: string
}

/**
 * Оптимизированная версия CatalogContent
 * Использует кастомные хуки для управления состоянием и API запросами
 * Обеспечивает максимальную производительность и простоту поддержки
 */
export function CatalogContentOptimized() {
  // Toast уведомления
  const { toasts, addToast, removeToast } = useToast()
  
  // Состояние модального окна фильтров
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  
  // URL состояние для всех фильтров
  const [category, setCategory] = useURLString('category', 'all')
  const [experience, setExperience] = useURLString('experience', 'any')
  const [format, setFormat] = useURLArray('format', [])
  const [verified, setVerified] = useURLBoolean('verified', false)
  const [sortBy, setSortBy] = useURLString('sortBy', 'relevance')
  const [search, setSearch] = useURLString('search', '')

  // Мемоизированные фильтры для API
  const filters = useMemo<FilterState>(() => ({
    category,
    experience,
    format,
    verified,
    sortBy,
    search
  }), [category, experience, format, verified, sortBy, search])

  // API запросы с кэшированием
  const { specialists, pagination, loading, error, refetch, loadMore } = useSpecialists(filters)

  // Обработка ошибок
  if (error) {
    addToast({
      type: 'error',
      title: 'Ошибка загрузки',
      description: error,
    })
  }

  // Мемоизированные обработчики фильтров
  const handleFilterChange = useMemo(() => ({
    category: (value: string) => setCategory(value),
    experience: (value: string) => setExperience(value),
    format: (value: string[]) => setFormat(value),
    verified: (value: boolean) => setVerified(value),
    sortBy: (value: string) => setSortBy(value),
  }), [setCategory, setExperience, setFormat, setVerified, setSortBy])

  const handleResetFilters = useMemo(() => () => {
    setCategory('all')
    setExperience('any')
    setFormat([])
    setVerified(false)
    setSortBy('relevance')
    setSearch('')
    setIsFilterModalOpen(false)
  }, [setCategory, setExperience, setFormat, setVerified, setSortBy, setSearch])

  // Мемоизированная функция для подсчета активных фильтров
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (category !== 'all') count++
    if (experience !== 'any') count++
    if (format.length > 0) count++
    if (verified) count++
    if (sortBy !== 'relevance') count++
    return count
  }, [category, experience, format, verified, sortBy])

  return (
    <>
      {/* Toast уведомления */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Поисковая строка */}
      <SearchBar
        value={search}
        onChange={setSearch}
      />

      {/* Панель фильтров */}
      <div className="flex items-center justify-between mb-6">
        <FilterButton
          filters={filters}
          totalCount={pagination?.totalCount || 0}
          onClick={() => setIsFilterModalOpen(true)}
        />

        {/* Сортировка */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="relevance">По релевантности</option>
          <option value="rating">По рейтингу</option>
          <option value="experience">По опыту</option>
          <option value="price">По цене</option>
        </select>
      </div>

      {/* Сетка специалистов */}
      {loading && specialists.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <SpecialistGrid
          specialists={specialists}
          pagination={pagination}
          onLoadMore={loadMore}
        />
      )}

      {/* Модальное окно фильтров */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={(newFilters) => {
          Object.entries(newFilters).forEach(([key, value]) => {
            switch (key) {
              case 'category':
                setCategory(value as string)
                break
              case 'experience':
                setExperience(value as string)
                break
              case 'format':
                setFormat(value as string[])
                break
              case 'verified':
                setVerified(value as boolean)
                break
              case 'sortBy':
                setSortBy(value as string)
                break
            }
          })
        }}
        onReset={handleResetFilters}
      />
    </>
  )
}
