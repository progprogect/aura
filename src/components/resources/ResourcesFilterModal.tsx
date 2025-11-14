/**
 * Модальное окно фильтров для библиотеки ресурсов
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/icons/Icon'
import { X } from '@/components/ui/icons/catalog-icons'
import { useCategoryMap } from '@/hooks/useCategories'
import { useScrollLock } from '@/hooks/useScrollLock'
import { ResourceFilterState } from '@/lib/resources/types'
import { TYPE_OPTIONS, SORT_OPTIONS } from '@/lib/resources/constants'
import { FilterRadioButton } from '@/components/catalog/filters/FilterRadioButton'

interface ResourcesFilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: ResourceFilterState
  onFilterChange: (filters: Partial<ResourceFilterState>) => void
  onReset: () => void
}

function areFiltersEqual(a: ResourceFilterState, b: ResourceFilterState): boolean {
  return (
    a.category === b.category &&
    a.type === b.type &&
    a.sortBy === b.sortBy &&
    a.search === b.search
  )
}

export function ResourcesFilterModal({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
}: ResourcesFilterModalProps) {
  const { categories, loading } = useCategoryMap()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const [draftFilters, setDraftFilters] = useState<ResourceFilterState>(filters)

  const prevIsOpenRef = useRef(isOpen)
  
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setDraftFilters(filters)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, filters])

  const hasChanges = !areFiltersEqual(draftFilters, filters)

  const handleApply = useCallback(() => {
    onFilterChange(draftFilters)
    onClose()
  }, [draftFilters, onFilterChange, onClose])

  const handleClose = useCallback(() => {
    setDraftFilters(filters)
    onClose()
  }, [filters, onClose])

  useScrollLock(isOpen)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      setTimeout(() => modalRef.current?.focus(), 100)
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        handleClose()
      }

      if (e.key === 'Enter' && hasChanges && !e.shiftKey) {
        e.preventDefault()
        handleApply()
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [isOpen, hasChanges, handleClose, handleApply])

  const handleCategoryChange = (category: string) => {
    setDraftFilters((prev) => ({ ...prev, category }))
  }

  const handleTypeChange = (type: string) => {
    setDraftFilters((prev) => ({ ...prev, type }))
  }

  const handleSortChange = (sortBy: string) => {
    setDraftFilters((prev) => ({ ...prev, sortBy }))
  }

  const handleResetClick = () => {
    onReset()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-md transition-opacity duration-300"
          onClick={handleClose}
          aria-hidden="true"
        />

        <div
          ref={modalRef}
          className="
            inline-block align-bottom bg-white text-left shadow-2xl transform transition-all
            sm:my-8 sm:align-middle sm:w-full sm:max-w-3xl lg:max-w-4xl sm:rounded-2xl sm:overflow-hidden
            max-sm:fixed max-sm:inset-0 max-sm:z-50 max-sm:w-full max-sm:h-full max-sm:rounded-none max-sm:flex max-sm:flex-col
          "
          role="document"
          tabIndex={-1}
        >
          <div className="bg-white px-6 sm:px-8 pt-6 pb-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3
                id="filter-modal-title"
                className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2"
              >
                <span>Все фильтры</span>
                {draftFilters.sortBy !== 'popularity' && (
                  <span className="text-sm sm:text-base font-normal text-gray-600">
                    · {SORT_OPTIONS.find((opt) => opt.value === draftFilters.sortBy)?.label}
                  </span>
                )}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                aria-label="Закрыть модальное окно"
              >
                <Icon icon={X} size={24} aria-hidden />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 sm:px-8 py-6 overflow-y-auto sm:max-h-[60vh] max-sm:flex-1">
            <div className="space-y-8">
              {/* Категория специалиста */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 tracking-wide uppercase mb-4">
                  Категория специалиста
                </legend>
                {loading ? (
                  <div className="text-sm text-gray-500">Загрузка...</div>
                ) : (
                  <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]" role="radiogroup">
                    <FilterRadioButton
                      label="Все категории"
                      value="all"
                      checked={draftFilters.category === 'all'}
                      onChange={handleCategoryChange}
                    />

                    {Array.from(categories.values()).map((category) => (
                      <FilterRadioButton
                        key={category.key}
                        label={category.name}
                        value={category.key}
                        checked={draftFilters.category === category.key}
                        onChange={handleCategoryChange}
                      />
                    ))}
                  </div>
                )}
              </fieldset>

              {/* Тип ресурса */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 tracking-wide uppercase mb-4">
                  Тип ресурса
                </legend>
                <div className="space-y-3" role="radiogroup">
                  {TYPE_OPTIONS.map((option) => (
                    <FilterRadioButton
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      checked={draftFilters.type === option.value}
                      onChange={handleTypeChange}
                    />
                  ))}
                </div>
              </fieldset>

              {/* Сортировка */}
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900 tracking-wide uppercase mb-4">
                  Сортировка
                </legend>
                <div className="space-y-3" role="radiogroup">
                  {SORT_OPTIONS.map((sort) => (
                    <FilterRadioButton
                      key={sort.value}
                      label={sort.label}
                      value={sort.value}
                      checked={draftFilters.sortBy === sort.value}
                      onChange={handleSortChange}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-6 sm:px-8 py-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={handleResetClick}
              className="
                w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300
                bg-white text-gray-700 font-medium text-sm sm:text-base
                hover:bg-gray-50 hover:border-gray-400
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2
                active:scale-[0.98]
                transition-all duration-200 ease-out
              "
            >
              Сбросить
            </button>
            <button
              onClick={handleApply}
              className="
                w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-sm sm:text-base
                bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2
                active:scale-[0.98]
                transition-all duration-200 ease-out
              "
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

